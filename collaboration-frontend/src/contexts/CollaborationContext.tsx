import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SOCKET_URL } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import roomService from '@/services/roomService';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface ReadReceipt {
  user: User | string; // Can be ID or User object
  readAt: Date;
}

export interface Attachment {
  url: string;
  type: 'image' | 'file';
  name: string;
}

export interface Message {
  _id: string;
  user: User;
  message: string;
  timestamp: Date;
  readBy: ReadReceipt[];
  attachments?: Attachment[];
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  members: User[];
  messages: Message[];
  createdAt: Date;
}

interface CollaborationContextType {
  socket: Socket | null;
  currentRoom: Room | null;
  isConnected: boolean;
  messages: Message[];
  typingUsers: { userId: string; userName: string }[];
  onlineUsers: User[];
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  markMessagesRead: (messageIds: string[]) => void;
  uploadFile: (file: File) => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextType>({
  socket: null,
  currentRoom: null,
  isConnected: false,
  messages: [],
  typingUsers: [],
  onlineUsers: [],
  joinRoom: async () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  startTyping: () => {},
  stopTyping: () => {},
  markMessagesRead: () => {},
  uploadFile: async () => {},
});

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const joinRoom = useCallback(async (roomId: string) => {
    if (!socket) return;
    
    if (currentRoom && currentRoom.id !== roomId) {
      socket.emit('leave-room', currentRoom.id);
    }
    
    socket.emit('join-room', roomId);
    setCurrentRoom({
      id: roomId,
      name: '',
      members: [],
      messages: [],
      createdAt: new Date()
    });
    setTypingUsers([]);
    setOnlineUsers([]);
    
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const history = await roomService.getRoomMessages(roomId, token);
        const formattedMessages = history.map((msg: {
          _id: string;
          sender: User;
          content: string;
          createdAt: string;
          readBy?: ReadReceipt[];
          attachments?: Attachment[];
        }) => ({
          _id: msg._id,
          user: msg.sender,
          message: msg.content,
          timestamp: new Date(msg.createdAt),
          readBy: msg.readBy || [],
          attachments: msg.attachments || []
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('❌ Failed to load message history:', error);
      setMessages([]);
    }
  }, [socket, currentRoom]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('leave-room', roomId);
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers([]);
    setOnlineUsers([]);
  }, [socket]);

  const sendMessage = useCallback((roomId: string, message: string) => {
    if (!socket) return;
    socket.emit('send-message', { roomId, message });
    socket.emit('typing-stop', roomId);
  }, [socket]);

  const startTyping = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('typing-start', roomId);
  }, [socket]);

  const stopTyping = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('typing-stop', roomId);
  }, [socket]);

  const markMessagesRead = useCallback((messageIds: string[]) => {
    if (!socket || !currentRoom) return;
    if (messageIds.length === 0) return;
    
    socket.emit('mark-messages-read', {
      roomId: currentRoom.id,
      messageIds
    });
  }, [socket, currentRoom]);

  const uploadFile = useCallback(async (file: File) => {
    if (!currentRoom) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await roomService.uploadFile(currentRoom.id, file, token);
      // Message is broadcasted via socket, no manual state update needed here
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error("File Upload Failed");
    }
  }, [currentRoom]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => setIsConnected(true));
      newSocket.on('disconnect', () => setIsConnected(false));

      newSocket.on('receive-message', (message: Message) => {
        setMessages((prev) => [...prev, {
            _id: message._id,
            user: message.user,
            message: message.message,
            timestamp: new Date(message.timestamp),
            readBy: message.readBy || [],
            attachments: message.attachments || []
        }]);
        setTypingUsers((prev) => prev.filter(u => u.userId !== message.user._id));
      });

      newSocket.on('messages-read-update', (data: { roomId: string, userId: string, messageIds: string[], readAt: Date }) => {
        if (currentRoom && data.roomId !== currentRoom.id) return; // Ignore if not current room

        setMessages((prevMessages) => {
            return prevMessages.map((msg) => {
                if (data.messageIds.includes(msg._id)) {
                    // Check if user already marked as read
                    const alreadyRead = msg.readBy.some(r => {
                        const id = typeof r.user === 'string' ? r.user : r.user._id;
                        return id === data.userId;
                    });
                    
                    if (!alreadyRead) {
                        return {
                            ...msg,
                            readBy: [...msg.readBy, { user: data.userId, readAt: new Date(data.readAt) }]
                        };
                    }
                }
                return msg;
            });
        });
      });

      newSocket.on('user-typing', (data) => {
        setTypingUsers((prev) => {
          if (prev.some(u => u.userId === data.userId)) return prev;
          return [...prev, data];
        });
      });

      newSocket.on('user-stopped-typing', (data) => {
        setTypingUsers((prev) => prev.filter(u => u.userId !== data.userId));
      });

      newSocket.on('room-users-update', (users) => setOnlineUsers(users));

      newSocket.on('user-joined-notification', (n) => toast.success(n.title, { description: n.message }));
      newSocket.on('user-left-notification', (n) => toast.info(n.title, { description: n.message }));
      newSocket.on('room-joined-confirmation', (d) => toast.success("Room Joined", { description: d.message }));
      
      newSocket.on('room-deleted', () => {
        toast.error("Room Deleted", { description: "This room has been deleted by the host." });
        navigate('/dashboard');
        setCurrentRoom(null);
      });

      newSocket.on('room-updated', (updatedRoom) => {
        setCurrentRoom((prev) => {
            if (prev && prev.id === updatedRoom._id) {
                return { ...prev, name: updatedRoom.name, description: updatedRoom.description };
            }
            return prev;
        });
        toast.info("Room Updated");
      });

      newSocket.on('member-removed', (data) => {
        if (user && data.userId === user._id) {
            toast.error("Removed from Room", { description: "You have been removed from this room." });
            navigate('/dashboard');
            setCurrentRoom(null);
        } else {
            setCurrentRoom((prev) => {
                if (!prev) return null;
                return { ...prev, members: prev.members.filter(m => m._id !== data.userId) };
            });
            setOnlineUsers((prev) => prev.filter(u => u._id !== data.userId));
        }
      });

      newSocket.on('inactivity-disconnect', (d) => {
        toast.warning("Session Timeout", { 
            description: d.message, 
            duration: Infinity, 
            action: { label: "Refresh", onClick: () => window.location.reload() } 
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // removed socket from deps to avoid loop, logic depends on user mainly

  const value = {
    socket,
    currentRoom,
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    uploadFile
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}
 