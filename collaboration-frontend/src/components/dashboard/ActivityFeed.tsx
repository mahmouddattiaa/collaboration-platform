import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Activity, User, FolderPlus, CheckCircle, LogIn, LogOut, Settings, Trash2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { apiClient } from '@/services/apiClient';

interface ActivityItem {
  _id: string;
  action: string;
  details: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export function ActivityFeed({ roomId }: { roomId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { socket } = useCollaboration();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await apiClient.get<any>(`/api/rooms/${roomId}/activities`, token);
        if (response.success) {
          setActivities(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewActivity = (activity: ActivityItem) => {
      setActivities((prev) => [activity, ...prev].slice(0, 50)); // Keep last 50
    };

    socket.on('new-activity', handleNewActivity);

    return () => {
      socket.off('new-activity', handleNewActivity);
    };
  }, [socket]);

  const getIcon = (action: string) => {
    switch (action) {
      case 'JOINED_ROOM': return <LogIn className="w-4 h-4 text-green-400" />;
      case 'LEFT_ROOM': return <LogOut className="w-4 h-4 text-red-400" />;
      case 'CREATED_PROJECT': return <FolderPlus className="w-4 h-4 text-blue-400" />;
      case 'COMPLETED_TASK': return <CheckCircle className="w-4 h-4 text-yellow-400" />;
      case 'UPDATED_ROOM': return <Settings className="w-4 h-4 text-purple-400" />;
      case 'REMOVED_MEMBER': return <Trash2 className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (activities.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Recent Activity
          </h3>
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2 py-1 rounded-full">Live</span>
        </div>
        <div className="text-center py-12 text-white/40">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm mt-2">Actions will appear here in real-time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Recent Activity
        </h3>
        <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2 py-1 rounded-full animate-pulse">Live</span>
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {activities.map((item) => (
            <div key={item._id} className="flex gap-3 items-start group">
              <div className="mt-1">
                <Avatar className="w-8 h-8 border border-white/10">
                  <AvatarImage src={item.userId?.profilePicture} />
                  <AvatarFallback className="bg-dark-secondary text-xs">
                    {item.userId?.name?.substring(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white truncate">
                    {item.userId?.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-white/40 whitespace-nowrap">
                    {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="bg-white/5 p-1 rounded-md">
                    {getIcon(item.action)}
                  </span>
                  <span className="truncate">{item.details}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
