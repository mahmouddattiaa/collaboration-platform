import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/utils';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
}

interface PresenceAvatarGroupProps {
  participants?: Participant[];
  maxAvatars?: number;
}

export function PresenceAvatarGroup({ participants = [], maxAvatars = 3 }: PresenceAvatarGroupProps) {
  const displayedParticipants = participants.slice(0, maxAvatars);
  const remainingCount = Math.max(0, participants.length - maxAvatars);

  return (
    <div className="flex -space-x-2">
      {displayedParticipants.map((participant) => (
        <div key={participant.id} className="relative">
          <Avatar className="border-2 border-background w-8 h-8">
            {participant.avatar ? (
              <AvatarImage src={participant.avatar} alt={participant.name} />
            ) : (
              <AvatarFallback className="bg-theme-primary/20 text-theme-primary">
                {participant.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <span 
            className={cn(
              'absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white',
              participant.status === 'online' ? 'bg-theme-emerald' :
              participant.status === 'away' ? 'bg-theme-yellow' :
              'bg-gray-400'
            )} 
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-background text-xs font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  );
} 