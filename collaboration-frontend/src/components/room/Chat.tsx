import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCollaboration, Message, User } from '@/contexts/CollaborationContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Check, CheckCheck, Info, Paperclip, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInView } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  roomMembers: User[];
  onRead: (id: string) => void;
}

const MessageBubble = ({ message, isMe, roomMembers, onRead }: MessageBubbleProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  useEffect(() => {
    if (isInView && !isMe) {
      // Check if I have already read it
      // The context/socket logic handles the actual check, but we can optimize here
      // But 'readBy' might not be updated yet in local state if we just loaded.
      // We simply trigger onRead, context will filter if needed or backend will.
      onRead(message._id);
    }
  }, [isInView, isMe, message._id, onRead]);

  // Calculate Read Status
  const readCount = message.readBy?.length || 0;
  const isSent = true; // If it's in the list, it's sent (saved)
  // Exclude sender from "all" count requirement
  const otherMembersCount = Math.max(0, roomMembers.length - 1); 
  // ReadBy usually includes sender if we auto-add them, so we check count
  // If readBy includes sender, then we compare with roomMembers.length
  const isReadByAll = readCount >= roomMembers.length;
  const isReadBySome = readCount > 1; // Assuming sender is 1

  // Get list of readers (excluding sender/self if needed, but usually "Read by" lists everyone else)
  const readers = useMemo(() => {
    if (!message.readBy) return [];
    return message.readBy
      .map(r => {
        const u = r.user as User | string; // It might be ID or Object
        // Try to find user in roomMembers if it's just an ID, or use the object
        if (typeof u === 'string') {
            return roomMembers.find(m => m._id === u) || { name: 'Unknown' };
        }
        return u;
      })
      .filter(u => u._id !== message.user._id); // Exclude sender from the "Read by" list tooltip
  }, [message.readBy, roomMembers, message.user._id]);

  const attachment = message.attachments?.[0];

  return (
    <div
      ref={ref}
      className={cn('flex items-start gap-3 mb-4', isMe ? 'justify-end' : 'justify-start')}
    >
      {!isMe && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.user.profilePicture} alt={message.user.name} />
          <AvatarFallback>{message.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] md:max-w-[60%] p-3 rounded-2xl shadow-sm relative group',
          isMe
            ? 'bg-theme-primary text-white rounded-tr-none'
            : 'bg-dark-secondary border border-white/10 text-gray-200 rounded-tl-none'
        )}
      >
        {!isMe && (
          <p className="text-xs font-bold text-theme-primary mb-1 opacity-90">
            {message.user.name}
          </p>
        )}
        
        {attachment ? (
          <div className="mb-2">
            {attachment.type === 'image' ? (
              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={attachment.url} 
                  alt="Shared Image" 
                  className="rounded-lg max-h-60 object-cover border border-white/10 hover:opacity-90 transition-opacity"
                />
              </a>
            ) : (
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10 hover:bg-black/30 transition-colors"
              >
                <div className="p-2 bg-theme-primary/20 rounded-lg">
                  <FileText className="w-5 h-5 text-theme-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-white/50">Click to download</p>
                </div>
              </a>
            )}
          </div>
        ) : null}

        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
        
        <div className="flex items-center justify-end gap-1 mt-1 select-none">
          <span className={cn("text-[10px]", isMe ? "text-white/70" : "text-gray-400")}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {isMe && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    {isReadByAll ? (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                    ) : isReadBySome ? (
                      <CheckCheck className="w-3.5 h-3.5 text-white/60" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-white/60" />
                    )}
                  </div>
                </TooltipTrigger>
                {readers.length > 0 && (
                  <TooltipContent side="bottom" className="bg-dark border-white/10 text-xs">
                    <p className="font-semibold mb-1">Read by:</p>
                    <ul className="list-none space-y-0.5">
                      {readers.map((r: any) => (
                        <li key={r._id || Math.random()} className="text-white/80">{r.name}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export function Chat() {
  const { currentRoom, messages, sendMessage, isConnected, startTyping, stopTyping, typingUsers, onlineUsers, markMessagesRead, uploadFile } = useCollaboration();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, typingUsers.length]);

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

  const handleRead = (messageId: string) => {
    markMessagesRead([messageId]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark/30 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-dark/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Chat</h3>
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40 border border-white/5">
            {messages.length} messages
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            {onlineUsers.slice(0, 3).map((u, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-dark border border-white/10">
                      <AvatarImage src={u.profilePicture} alt={u.name} />
                      <AvatarFallback className="bg-theme-primary/20 text-[10px] text-theme-primary font-bold">
                        {u.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent><p>{u.name}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {onlineUsers.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-dark bg-dark-secondary border border-white/10 text-[10px] font-medium text-white/60">
                +{onlineUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isMe={msg.user._id === user?._id}
              roomMembers={currentRoom?.members || []}
              onRead={handleRead}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Send className="w-5 h-5 text-white/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">No messages yet</p>
              <p className="text-xs text-white/40">Start the conversation!</p>
            </div>
          </div>
        )}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-theme-primary animate-pulse ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="text-white/40 font-medium">
              {typingUsers.length === 1
                ? `${typingUsers[0].userName} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark/60 border-t border-white/10 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            type="text"
            placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
            value={newMessage}
            onChange={handleInputChange}
            className="flex-1 bg-white/5 border-white/10 text-white rounded-full pr-12 focus:ring-theme-primary/50 focus:border-theme-primary/50 transition-all placeholder:text-white/20"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            size="icon"
            className={cn(
              "absolute right-1.5 top-1.5 h-7 w-7 rounded-full transition-all duration-300",
              newMessage.trim() 
                ? "bg-theme-primary hover:bg-theme-primary/90 text-white scale-100 opacity-100" 
                : "bg-transparent text-white/20 scale-90 opacity-0 pointer-events-none"
            )}
            disabled={!isConnected || !newMessage.trim()}
          >
            <Send className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
