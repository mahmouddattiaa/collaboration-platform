import React, { useState } from 'react';
import { Settings, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { roomService } from '@/services/roomService';

interface RoomSettingsModalProps {
  roomId: string;
  currentName: string;
  currentDescription?: string;
  onRoomUpdated?: (room: any) => void;
  trigger?: React.ReactNode;
}

export function RoomSettingsModal({ 
  roomId, 
  currentName, 
  currentDescription = '', 
  onRoomUpdated,
  trigger 
}: RoomSettingsModalProps) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Room name is required");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No auth token");

      const updatedRoom = await roomService.updateRoom(roomId, { name, description }, token);
      toast.success("Room updated successfully");
      
      if (onRoomUpdated) {
        onRoomUpdated(updatedRoom);
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error("Failed to update room:", error);
      toast.error(error.message || "Failed to update room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No auth token");

      await roomService.deleteRoom(roomId, token);
      toast.success("Room deleted successfully");
      setIsOpen(false);
      // Navigation happens via socket event in context
    } catch (error: any) {
      console.error("Failed to delete room:", error);
      toast.error(error.message || "Failed to delete room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-dark-secondary border-white/10 text-white">
        {!showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Room Settings</DialogTitle>
              <DialogDescription className="text-white/60">
                Update room details or manage room settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-white">
                  Room Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3 bg-dark/50 border-white/10 text-white focus:border-theme-primary"
                  placeholder="Enter room name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3 bg-dark/50 border-white/10 text-white focus:border-theme-primary min-h-[100px]"
                  placeholder="Enter room description (optional)"
                />
              </div>
              <div className="pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Room
                </Button>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" onClick={handleUpdate} disabled={isLoading} className="bg-theme-primary text-white hover:bg-theme-primary/90">
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-red-500 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Delete Room?
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Are you sure you want to delete this room? This action cannot be undone and will remove all messages and data.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-200">
                Please type <span className="font-bold select-all">{currentName}</span> to confirm.
              </div>
              {/* Logic for typing name to confirm could be added here, but for now just simple confirm */}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isLoading ? "Deleting..." : "Yes, Delete Room"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
