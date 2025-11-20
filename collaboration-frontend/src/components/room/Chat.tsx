import React, { useState, useRef, useEffect } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Chat() {
  const { currentRoom, sendMessage, isConnected } = useCollaboration();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentRoom?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const getParticipantName = (senderId: string) => {
    if (!currentRoom) return 'Unknown User';
    if (senderId === user?._id) return 'You';
    const participant = currentRoom.participants.find(p => p.id === senderId);
    return participant?.name || 'Unknown User';
  };
  
  const getParticipantAvatar = (senderId: string) => {
    if (!currentRoom) return undefined;
    const participant = currentRoom.participants.find(p => p.id === senderId);
    return participant?.avatar;
  };


  return (
    <div className="flex flex-col h-full bg-dark/50 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentRoom?.messages && currentRoom.messages.length > 0 ? (
          currentRoom.messages.map((msg) => {
            const isMe = msg.senderId === user?._id;
            return (
              <div
                key={msg.id}
                className={cn('flex items-start gap-3', isMe ? 'justify-end' : 'justify-start')}
              >
                {!isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getParticipantAvatar(msg.senderId)} alt={getParticipantName(msg.senderId)} />
                    <AvatarFallback>{getParticipantName(msg.senderId).charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl',
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-700 text-gray-200 rounded-bl-none'
                  )}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold text-blue-300 mb-1">
                      {getParticipantName(msg.senderId)}
                    </p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isMe && (
                   <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 my-auto">
            <p>No messages yet.</p>
            <p>Be the first to say something!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-dark/70 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Input
            type="text"
            placeholder={isConnected ? 'Type your message...' : 'Connecting...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-800 border-gray-700 text-white rounded-full"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-blue-600 hover:bg-blue-700"
            disabled={!isConnected || !newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
