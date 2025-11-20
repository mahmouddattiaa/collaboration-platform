import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from "@/config/api";
// import collaborationApi from "@/services/collaboration"; // Commented out - file doesn't exist
import { useAuth } from "@/contexts/AuthContext";

// Types ---------------------------------------------------
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
  };
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  participants: Participant[];
  messages: Message[];
  createdAt: Date;
}

interface CollaborationContextType {
  socket: Socket | null;
  currentRoom: Room | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (content: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
  socket: null,
  currentRoom: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {}
});

// Provider ------------------------------------------------
export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const connect = useCallback(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: `Bearer ${token}`
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

    newSocket.on('room-data', ({ room }) => {
      setCurrentRoom(room);
    });

    newSocket.on('participant-joined', ({ room }) => {
      setCurrentRoom(room);
    });

    newSocket.on('participant-left', ({ room }) => {
      setCurrentRoom(room);
    });

    newSocket.on('new-message', ({ room }) => {
      setCurrentRoom(room);
    });

    newSocket.on('error', ({ message }) => {
      console.error('Collaboration server error:', message);
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
    if (!socket || !user) return;

    socket.emit('join-room', {
      roomId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.profilePicture
    });
  }, [socket, user]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket || !user) return;

    socket.emit('leave-room', {
      roomId,
      userId: user.id
    });

    setCurrentRoom(null);
  }, [socket, user]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !currentRoom || !user) return;

    socket.emit('send-message', {
      roomId: currentRoom.id,
      message: {
        userId: user.id,
        content,
        type: 'text',
        timestamp: new Date()
      }
    });
  }, [socket, currentRoom, user]);

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

// Hook ----------------------------------------------------
export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
} 