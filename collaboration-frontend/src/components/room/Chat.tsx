import React, { useState, useRef, useEffect } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Chat() {
  const { currentRoom, messages, sendMessage, isConnected, startTyping, stopTyping, typingUsers, onlineUsers } = useCollaboration();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (currentRoom && isConnected) {
      startTyping(currentRoom.id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentRoom.id);
      }, 1000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected && currentRoom) {
      sendMessage(currentRoom.id, newMessage);
      setNewMessage('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping(currentRoom.id);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark/50 rounded-lg">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-dark/80 rounded-t-lg">
        <div>
          <h3 className="font-semibold text-white">Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {onlineUsers.slice(0, 3).map((u, i) => (
              <Avatar key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-gray-800">
                 <AvatarImage src={u.profilePicture} alt={u.name} />
                 <AvatarFallback className="bg-blue-600 text-[10px] text-white">{u.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {onlineUsers.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-gray-800 bg-gray-600 text-[10px] font-medium text-white">
                +{onlineUsers.length - 3}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-green-400">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
             <span>{onlineUsers.length} Online</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => {
            const isMe = msg.user._id === user?._id;
            return (
              <div
                key={index}
                className={cn('flex items-start gap-3', isMe ? 'justify-end' : 'justify-start')}
              >
                {!isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.user.profilePicture} alt={msg.user.name} />
                    <AvatarFallback>{msg.user.name.charAt(0)}</AvatarFallback>
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
                      {msg.user.name}
                    </p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400 ml-2">
            <span className="animate-pulse">●●●</span>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0].userName} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
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
            onChange={handleInputChange}
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
