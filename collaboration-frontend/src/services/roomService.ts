import apiClient from './apiClient';
import { 
  CreateRoomRequest, 
  CreateRoomResponse, 
  JoinRoomRequest, 
  JoinRoomResponse,
  Room 
} from '@/types/room';

class RoomService {
  // Create new room
  async createRoom(roomData: CreateRoomRequest, token: string): Promise<CreateRoomResponse> {
    const response = await apiClient.post<CreateRoomResponse>(
      '/api/rooms/create',
      roomData,
      token
    );
    return response as CreateRoomResponse;
  }

  // Join room by code
  async joinRoom(joinData: JoinRoomRequest, token: string): Promise<JoinRoomResponse> {
    const response = await apiClient.post<JoinRoomResponse>(
      '/api/rooms/join',
      joinData,
      token
    );
    return response as JoinRoomResponse;
  }

  // Get room details
  async getRoomById(roomId: string, token: string): Promise<Room> {
    const response = await apiClient.get<Room>(`/api/rooms/${roomId}`, token);
    return response.data as Room;
  }

  // Get user's rooms
  async getUserRooms(token: string): Promise<Room[]> {
    const response = await apiClient.get<Room[]>('/api/rooms', token);
    return response.data as Room[];
  }

  // Update room
  async updateRoom(roomId: string, updates: Partial<Room>, token: string): Promise<Room> {
    const response = await apiClient.patch<Room>(`/api/rooms/${roomId}`, updates, token);
    return response.data as Room;
  }

  // Delete room
  async deleteRoom(roomId: string, token: string): Promise<void> {
    await apiClient.delete(`/api/rooms/${roomId}`, token);
  }
}

// Create and export room service instance
export const roomService = new RoomService();
export default roomService;
