// Room types
export interface Room {
  _id: string;
  name: string;
  description?: string;
  dashboardName: string;
  roomCode: string;
  createdBy: string;
  invitedPeople: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  dashboardName: string;
  invitedPeople: string[];
}

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  room: Room;
}

export interface JoinRoomRequest {
  roomCode: string;
}

export interface JoinRoomResponse {
  success: boolean;
  message: string;
  room: Room;
}

export interface RoomMember {
  userId: string;
  name: string;
  email: string;
  role: 'creator' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
  status: 'online' | 'away' | 'offline';
}
