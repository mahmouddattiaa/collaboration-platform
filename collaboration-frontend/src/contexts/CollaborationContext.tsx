import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { SOCKET_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Message {
  user: User;
  message: string;
  timestamp: Date;
}

export interface Room {
  id: string;
  name: string;
  members: User[];
  messages: Message[];
  createdAt: Date;
}

interface CollaborationContextType {
  socket: Socket | null;
  currentRoom: Room | null;
  isConnected: boolean;
  messages: Message[];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
  socket: null,
  currentRoom: null,
  isConnected: false,
  messages: [],
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {}
});

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  const joinRoom = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('join-room', roomId);
    setCurrentRoom({
      id: roomId,
      name: '',
      members: [],
      messages: [],
      createdAt: new Date()
    });
    setMessages([]);
  }, [socket]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('leave-room', roomId);
    setCurrentRoom(null);
    setMessages([]);
  }, [socket]);

  const sendMessage = useCallback((roomId: string, message: string) => {
    if (!socket) return;
    socket.emit('send-message', { roomId, message });
  }, [socket]);

  useEffect(() => {
    console.log('🔍 CollaborationContext useEffect - user:', user ? 'logged in' : 'not logged in');
    
    if (user) {
      const token = localStorage.getItem('token');
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

      newSocket.on('error', ({ message }) => {
        console.error('❌ Collaboration server error:', message);
        toast.error("Connection Error", {
          description: message,
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        console.error('Error details:', error);
        toast.error("Connection Failed", {
          description: error.message,
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
  }, [user]);

  const value = {
    socket,
    currentRoom,
    isConnected,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage
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