import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Users, Briefcase, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRoom } from '@/hooks/useRoom';

interface CreateRoomProps {
  onClose?: () => void;
}

export function CreateRoom({ onClose }: CreateRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [invitedPeople, setInvitedPeople] = useState('');
  const [dashboardName, setDashboardName] = useState('');
  const [error, setError] = useState('');

  const { createRoom, isLoading } = useRoom();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomName.trim() || !dashboardName.trim()) {
      setError('Room name and dashboard name are required');
      return;
    }

    // Process invited people emails
    const invitedEmails = invitedPeople
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    const roomData = {
      name: roomName,
      description: description || undefined,
      dashboardName,
      invitedPeople: invitedEmails,
    };

    const result = await createRoom(roomData);

    if (result.success && result.room) {
      // Navigate to the created room
      navigate(`/room/${result.room._id}`, {
        state: { room: result.room }
      });
      onClose?.();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-dark-secondary rounded-xl shadow-2xl w-full max-w-lg p-8 space-y-8 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-semibold text-white">Create New Workspace</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name Input */}
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium mb-2 text-theme-gray-light">
              Workspace Name
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Project Phoenix HQ"
                required
                className="bg-dark border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Dashboard Name Input */}
          <div>
            <label htmlFor="dashboardName" className="block text-sm font-medium mb-2 text-theme-gray-light">
              Dashboard Name
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="dashboardName"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="e.g., Main Dashboard"
                required
                className="bg-dark border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-theme-gray-light">
              Description <span className="text-gray-500">(Optional)</span>
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this workspace..."
              className="bg-dark border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          {/* Invited People Input */}
          <div>
            <label htmlFor="invitedPeople" className="block text-sm font-medium mb-2 text-theme-gray-light">
              Invite People <span className="text-gray-500">(Optional, comma-separated emails)</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="invitedPeople"
                value={invitedPeople}
                onChange={(e) => setInvitedPeople(e.target.value)}
                placeholder="e.g., team@example.com, user@example.com"
                className="bg-dark border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 border-white/20 hover:bg-white/10 text-white rounded-lg transition-colors duration-150"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-theme-primary to-theme-secondary hover:opacity-90 text-white font-semibold rounded-lg transition-opacity duration-150 shadow-md hover:shadow-lg"
              disabled={isLoading || !roomName.trim() || !dashboardName.trim()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Workspace
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
