import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

export function useChat(roomId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  // Socket connection useEffect
  useEffect(() => {
    if (token) {
      const newSocket = io('http://localhost:4001', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('connected to chat server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('disconnected from chat server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token]);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
      setCurrentRoom(roomId);
      setMessages([]);
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socket.on('user-joined', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        message: data.message,
        timestamp: new Date().toISOString()
      }]);
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-joined');
    };
  }, [socket]);

  const sendMessage = (message: string) => {
    if (socket && currentRoom && message.trim()) {
      socket.emit('send-message', {
        roomID: currentRoom,  
        message: message.trim(),
        timestamp: new Date().toISOString()  
      });
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
      setCurrentRoom(roomId);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave-room', currentRoom);
      setCurrentRoom(null);
      setMessages([]);
    }
  };

  return {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    isConnected,
    currentRoom
  };
}  