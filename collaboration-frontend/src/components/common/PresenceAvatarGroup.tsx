import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from '@/contexts/CollaborationContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PresenceAvatarGroupProps {
  members?: User[];
  onlineUsers?: User[];
  maxAvatars?: number;
}

export function PresenceAvatarGroup({ members = [], onlineUsers = [], maxAvatars = 3 }: PresenceAvatarGroupProps) {
  
  // Combine members with their status and sort by online status
  const participantsWithStatus = useMemo(() => {
    if (!members.length) return [];

    return members.map(member => ({
      ...member,
      status: onlineUsers.some(u => u._id === member._id) ? 'online' : 'offline'
    })).sort((a, b) => {
      // Sort online users first
      if (a.status === 'online' && b.status === 'offline') return -1;
      if (a.status === 'offline' && b.status === 'online') return 1;
      return 0;
    });
  }, [members, onlineUsers]);

  const displayedParticipants = participantsWithStatus.slice(0, maxAvatars);
  const remainingCount = Math.max(0, participantsWithStatus.length - maxAvatars);

  if (participantsWithStatus.length === 0 && onlineUsers.length > 0) {
    // Fallback if members list isn't populated but onlineUsers is (e.g. direct socket data without full room details)
    // We just show the online users we know about
    const onlineOnly = onlineUsers.slice(0, maxAvatars);
    return (
      <div className="flex -space-x-2">
         {onlineOnly.map((user) => (
           <TooltipProvider key={user._id}>
             <Tooltip>
               <TooltipTrigger asChild>
                  <div className="relative cursor-default transition-transform hover:-translate-y-0.5">
                    <Avatar className="border-2 border-dark w-8 h-8 ring-2 ring-dark">
                      <AvatarFallback className="bg-theme-primary/20 text-theme-primary text-xs font-bold">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : '??'}
                      </AvatarFallback>
                    </Avatar>
                    <span 
                      className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-dark bg-green-500"
                    />
                  </div>
               </TooltipTrigger>
               <TooltipContent side="bottom" className="text-xs">
                 <p>{user.name} (Online)</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
         ))}
      </div>
    );
  }

  return (
    <div className="flex -space-x-2">
      {displayedParticipants.map((participant) => (
        <TooltipProvider key={participant._id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative cursor-default transition-transform hover:-translate-y-0.5">
                <Avatar className="border-2 border-dark w-8 h-8 ring-2 ring-dark">
                  {participant.profilePicture ? (
                    <AvatarImage src={participant.profilePicture} alt={participant.name} />
                  ) : (
                    <AvatarFallback className="bg-theme-primary/20 text-theme-primary text-xs font-bold">
                      {participant.name ? participant.name.substring(0, 2).toUpperCase() : '??'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span 
                  className={cn(
                    'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-dark',
                    participant.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  )} 
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>{participant.name} ({participant.status})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-secondary border-2 border-dark ring-2 ring-dark text-[10px] font-bold text-white/80">
          +{remainingCount}
        </div>
      )}
    </div>
  );
} 