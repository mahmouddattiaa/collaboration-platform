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
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
  socket: null,
  currentRoom: null,
  isConnected: false,
  messages: [],
  connect: () => {},
  disconnect: () => {},
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

  const connect = useCallback(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: `${token}` // The backend expects the token without "Bearer "
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setIsConnected(false);
    });

    newSocket.on('receive-message', (message: Message) => {
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
      console.error('Collaboration server error:', message);
      toast.error("Connection Error", {
        description: message,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setCurrentRoom(null);
      setIsConnected(false);
    }
  }, [socket]);

  const joinRoom = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('join-room', roomId);
  }, [socket]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('leave-room', roomId);
    setCurrentRoom(null);
  }, [socket]);

  const sendMessage = useCallback((roomId: string, message: string) => {
    if (!socket) return;
    socket.emit('send-message', { roomId, message });
  }, [socket]);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  const value = {
    socket,
    currentRoom,
    isConnected,
    messages,
    connect,
    disconnect,
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