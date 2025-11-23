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
    const response = await apiClient.get<any>(`/api/rooms/${roomId}`, token);
    return (response as any).room as Room;
  }

  // Get user's rooms
  async getUserRooms(token: string): Promise<Room[]> {
    const response = await apiClient.get<any>('/api/rooms', token);
    console.log('📥 getUserRooms response:', response);
    // Backend returns { success: true, data: [...rooms] }
    return response.data || [];
  }

  // Get room messages
  async getRoomMessages(roomId: string, token: string): Promise<any[]> {
    const response = await apiClient.get<any>(`/api/rooms/${roomId}/messages`, token);
    return response.data || [];
  }

  // Update room
  async updateRoom(roomId: string, updates: Partial<Room>, token: string): Promise<Room> {
    const response = await apiClient.put<any>(`/api/rooms/${roomId}`, updates, token);
    return (response as any).room as Room;
  }

  // Delete room
  async deleteRoom(roomId: string, token: string): Promise<void> {
    await apiClient.delete(`/api/rooms/${roomId}`, token);
  }

  // Remove member
  async removeMember(roomId: string, userId: string, token: string): Promise<void> {
    await apiClient.delete(`/api/rooms/${roomId}/members/${userId}`, token);
  }

  // Upload file
  async uploadFile(roomId: string, file: File, token: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    // We need to use fetch directly or update apiClient to handle FormData
    // apiClient usually sets Content-Type: application/json which breaks FormData
    // Let's handle it here or update apiClient. Let's do a direct fetch for now or cast.
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}/api/rooms/${roomId}/files`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Content-Type header must NOT be set manually for FormData, browser sets it with boundary
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('File upload failed');
    }

    return await response.json();
  }
}

// Create and export room service instance
export const roomService = new RoomService();
export default roomService;
