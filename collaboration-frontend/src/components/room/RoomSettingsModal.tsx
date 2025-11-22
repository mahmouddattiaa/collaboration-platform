import React, { useState } from 'react';
import { Settings, Trash2, AlertTriangle, UserX, Shield } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { roomService } from '@/services/roomService';

interface RoomSettingsModalProps {
  roomId: string;
  currentName: string;
  currentDescription?: string;
  members?: any[];
  currentUserId?: string;
  onRoomUpdated?: (room: any) => void;
  trigger?: React.ReactNode;
}

export function RoomSettingsModal({ 
  roomId, 
  currentName, 
  currentDescription = '', 
  members = [],
  currentUserId,
  onRoomUpdated,
  trigger 
}: RoomSettingsModalProps) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');

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

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No auth token");

      await roomService.removeMember(roomId, userId, token);
      toast.success("Member removed successfully");
      // UI update will happen via socket event
    } catch (error: any) {
      console.error("Failed to remove member:", error);
      toast.error(error.message || "Failed to remove member");
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
      <DialogContent className="sm:max-w-[500px] bg-dark-secondary border-white/10 text-white max-h-[80vh] overflow-y-auto">
        {!showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Room Settings</DialogTitle>
              <DialogDescription className="text-white/60">
                Manage your room settings and members.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2 mb-4 border-b border-white/10">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'general' 
                    ? 'border-theme-primary text-theme-primary' 
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'members' 
                    ? 'border-theme-primary text-theme-primary' 
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                Members ({members.length})
              </button>
            </div>

            {activeTab === 'general' ? (
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
            ) : (
              <div className="space-y-4 py-2">
                {members.map((member) => {
                  // Handle populated vs unpopulated user data
                  const user = member.userId || member; 
                  const isMe = user._id === currentUserId;
                  const isHost = member.role === 'host';

                  return (
                    <div key={user._id} className="flex items-center justify-between p-2 rounded-lg bg-dark/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profilePicture} />
                          <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white flex items-center gap-2">
                            {user.name}
                            {isMe && <span className="text-xs text-white/40">(You)</span>}
                          </p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isHost && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-theme-primary/10 text-theme-primary text-xs">
                            <Shield className="w-3 h-3" />
                            <span>Host</span>
                          </div>
                        )}
                        
                        {!isHost && !isMe && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(user._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 p-0"
                            title="Remove Member"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'general' && (
              <DialogFooter>
                <Button type="submit" onClick={handleUpdate} disabled={isLoading} className="bg-theme-primary text-white hover:bg-theme-primary/90">
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            )}
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
