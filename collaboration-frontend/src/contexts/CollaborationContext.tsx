import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from "@/config/api";
import collaborationApi from "@/services/collaboration";
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

export interface WhiteboardElement {
  id: string;
  type: 'pencil' | 'line' | 'rectangle' | 'circle' | 'text';
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
}

export interface Room {
  id: string;
  name: string;
  participants: Participant[];
  messages: Message[];
  whiteboard: {
    elements: WhiteboardElement[];
  };
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
  updateWhiteboard: (elements: WhiteboardElement[]) => void;
  clearWhiteboard: () => void;
  syncWhiteboard: () => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
  socket: null,
  currentRoom: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  updateWhiteboard: () => {},
  clearWhiteboard: () => {},
  syncWhiteboard: () => {}
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

    const newSocket = io('http://localhost:4001', {
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

    newSocket.on('whiteboard:update', (elements: WhiteboardElement[]) => {
      setCurrentRoom((prev) => {
        if (!prev) return null;
        return {
        ...prev,
          whiteboard: {
            ...prev.whiteboard,
            elements
          }
        };
      });
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

  const updateWhiteboard = useCallback((elements: WhiteboardElement[]) => {
    if (!socket || !currentRoom) return;

    socket.emit('whiteboard:draw', {
      roomId: currentRoom.id,
      elements
    });
  }, [socket, currentRoom]);

  const clearWhiteboard = useCallback(() => {
    if (!socket || !currentRoom) return;

    socket.emit('whiteboard:clear', {
      roomId: currentRoom.id
    });
  }, [socket, currentRoom]);

  const syncWhiteboard = useCallback(() => {
    if (!socket || !currentRoom) return;

    socket.emit('whiteboard:sync', {
      roomId: currentRoom.id
    });
  }, [socket, currentRoom]);

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
    sendMessage,
    updateWhiteboard,
    clearWhiteboard,
    syncWhiteboard
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