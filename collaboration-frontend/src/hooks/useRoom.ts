import { useState, useCallback } from 'react';
import { Room, CreateRoomRequest } from '@/types/room';
import roomService from '@/services/roomService';
import { useAuth } from './useAuth';

export function useRoom() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create room function
  const createRoom = useCallback(async (roomData: CreateRoomRequest) => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await roomService.createRoom(roomData, token);
      
      if (response.success) {
        // Add new room to local state
        setRooms(prev => [response.room, ...prev]);
        return { success: true, room: response.room, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create room';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Join room function
  const joinRoom = useCallback(async (roomCode: string) => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await roomService.joinRoom({ roomCode }, token);
      
      if (response.success) {
        return { success: true, room: response.room, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to join room';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Get user rooms
  const getUserRooms = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const userRooms = await roomService.getUserRooms(token);
      setRooms(userRooms);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch rooms');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Get room by ID
  const getRoomById = useCallback(async (roomId: string) => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    try {
      const room = await roomService.getRoomById(roomId, token);
      return { success: true, room };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to get room' };
    }
  }, [token]);

  return {
    rooms,
    isLoading,
    error,
    createRoom,
    joinRoom,
    getUserRooms,
    getRoomById,
  };
}
