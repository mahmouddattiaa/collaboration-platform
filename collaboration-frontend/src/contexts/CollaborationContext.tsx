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

export interface Message {
  user: User;
  message: string;
  timestamp: Date;
  _id?: string; // Added ID for keys
}

export interface Room {
  id: string;
  name: string;
  description?: string; // Added description
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
  onlineUsers: User[]; // Added onlineUsers
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
  socket: null,
  currentRoom: null,
  isConnected: false,
  messages: [],
  typingUsers: [],
  onlineUsers: [], // Initial state
  joinRoom: async () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  startTyping: () => {},
  stopTyping: () => {},
});

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]); // State for online users
  const { user } = useAuth();
  const navigate = useNavigate();

  const joinRoom = useCallback(async (roomId: string) => {
    if (!socket) {
      console.error('❌ Cannot join room: socket not initialized');
      return;
    }
    if (!socket.connected) {
      console.error('❌ Cannot join room: socket not connected');
      return;
    }
    
    // Leave current room if exists
    if (currentRoom && currentRoom.id !== roomId) {
      console.log(`👋 Leaving previous room: ${currentRoom.id}`);
      socket.emit('leave-room', currentRoom.id);
    }
    
    console.log(`🚪 Emitting join-room event for: ${roomId}`);
    socket.emit('join-room', roomId);
    setCurrentRoom({
      id: roomId,
      name: '',
      members: [],
      messages: [],
      createdAt: new Date()
    });
    setTypingUsers([]); // Clear typing users on room switch
    setOnlineUsers([]); // Clear online users on room switch
    
    // Fetch message history
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const history = await roomService.getRoomMessages(roomId, token);
        const formattedMessages = history.map((msg: any) => ({
          user: msg.sender,
          message: msg.content,
          timestamp: new Date(msg.createdAt),
          _id: msg._id
        }));
        setMessages(formattedMessages);
        console.log(`📜 Loaded ${formattedMessages.length} messages from history`);
      }
    } catch (error) {
      console.error('❌ Failed to load message history:', error);
      toast.error('Failed to load chat history');
      setMessages([]);
    }

    console.log(`✅ Room state updated: ${roomId}`);
  }, [socket, currentRoom]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket || !socket.connected) {
      console.error('❌ Cannot leave room: socket not available');
      return;
    }
    console.log(`👋 Emitting leave-room event for: ${roomId}`);
    socket.emit('leave-room', roomId);
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers([]);
    setOnlineUsers([]);
    console.log(`✅ Left room: ${roomId}`);
  }, [socket]);

  const sendMessage = useCallback((roomId: string, message: string) => {
    if (!socket) return;
    socket.emit('send-message', { roomId, message });
    // Stop typing immediately after sending
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

  useEffect(() => {
    console.log('🔍 CollaborationContext useEffect - user:', user ? 'logged in' : 'not logged in');
    console.log('🔍 User object:', user);
    
    if (user) {
      const token = localStorage.getItem('authToken');
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Socket URL:', SOCKET_URL);
      
      if (!token) {
        console.error('❌ No token found in localStorage');
        return;
      }

      console.log('🔌 Attempting to connect to Socket.io server...');
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: `${token}`
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to collaboration server - Socket ID:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from collaboration server - Reason:', reason);
        setIsConnected(false);
      });

      newSocket.on('receive-message', (message: Message) => {
        console.log('📨 Received message:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
        // Also remove sender from typing list if they were there
        setTypingUsers((prev) => prev.filter(u => u.userId !== message.user._id));
      });

      newSocket.on('user-typing', (data: { userId: string, userName: string }) => {
        setTypingUsers((prev) => {
          if (prev.some(u => u.userId === data.userId)) return prev;
          return [...prev, data];
        });
      });

      newSocket.on('user-stopped-typing', (data: { userId: string }) => {
        setTypingUsers((prev) => prev.filter(u => u.userId !== data.userId));
      });

      newSocket.on('room-users-update', (users: User[]) => {
        console.log('👥 Active users updated:', users);
        setOnlineUsers(users);
      });

      newSocket.on('user-joined-notification', (notification: { title: string, message: string }) => {
        toast.success(notification.title, {
          description: notification.message,
        });
      });

      newSocket.on('user-left-notification', (notification: { title: string, message: string }) => {
        toast.info(notification.title, {
          description: notification.message,
        });
      });

      newSocket.on('room-joined-confirmation', (data: { roomId: string, message: string }) => {
        console.log('🎉 Room joined confirmation received:', data);
        toast.success("Room Joined", {
          description: data.message,
        });
      });

      // Listen for room deletion
      newSocket.on('room-deleted', (data: { roomId: string }) => {
        console.warn('🗑 Room deleted:', data.roomId);
        toast.error("Room Deleted", {
            description: "This room has been deleted by the host.",
        });
        // Check if we are currently in this room (or if we just navigate anyway to be safe)
        // We can compare with currentRoom state if needed, but navigating to dashboard is safe default
        navigate('/dashboard');
        setCurrentRoom(null);
      });

      // Listen for room updates
      newSocket.on('room-updated', (updatedRoom: any) => {
        console.log('📝 Room updated:', updatedRoom);
        setCurrentRoom((prev) => {
            if (prev && prev.id === updatedRoom._id) {
                return { ...prev, name: updatedRoom.name, description: updatedRoom.description };
            }
            return prev;
        });
        toast.info("Room Updated", {
            description: `Room settings have been updated.`,
        });
      });

      // Listen for member removal
      newSocket.on('member-removed', (data: { userId: string }) => {
        console.log('🚫 Member removed:', data.userId);
        
        if (user && data.userId === user._id) {
            toast.error("Removed from Room", {
                description: "You have been removed from this room by the host.",
            });
            navigate('/dashboard');
            setCurrentRoom(null);
        } else {
            // Update local state to remove the user
            setCurrentRoom((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    members: prev.members.filter(m => m._id !== data.userId)
                };
            });
            setOnlineUsers((prev) => prev.filter(u => u._id !== data.userId));
            // Optional: Toast notification
            // toast.info("Member Removed", { description: "A member was removed from the room." });
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        console.error('Error details:', error);
        toast.error("Connection Failed", {
          description: error.message,
        });
      });

      newSocket.on('inactivity-disconnect', (data: { message: string }) => {
        console.warn('💤 Received inactivity disconnect:', data.message);
        toast.warning("Session Timeout", {
          description: data.message,
          duration: Infinity, // Keep it visible until user dismisses or refreshes
          action: {
            label: "Refresh",
            onClick: () => window.location.reload()
          }
        });
      });

      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      console.log('💾 Socket instance created, setting to state...');
      setSocket(newSocket);

      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]); // navigate added to deps if strict, but usually stable

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
    stopTyping
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
 