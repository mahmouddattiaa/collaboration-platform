import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  LogOut, 
  Users, 
  Search,
  Home,
  Briefcase,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateRoom } from '@/components/room/CreateRoom';
import { JoinRoom } from '@/components/room/JoinRoom';
import { useAuth } from '@/hooks/useAuth';
import { useRoom } from '@/hooks/useRoom';

export function Dashboard() {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, logout } = useAuth();
  const { rooms, isLoading, getUserRooms } = useRoom();
  const navigate = useNavigate();

  // ✨ NEW: Load user's rooms when dashboard mounts
  useEffect(() => {
    getUserRooms();
  }, [getUserRooms]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.dashboardName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-dark-secondary border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Collaboration Hub</h1>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <span className="text-theme-gray-light">Welcome, {user?.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-white/10"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Your Workspaces</h2>
          <p className="text-theme-gray-light">
            Create and manage your collaborative workspaces
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="bg-dark-secondary border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          {/* Create Room Button */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowJoinRoom(true)}
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white rounded-lg px-6 py-3 transition-all duration-150"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Workspace
            </Button>
            <Button
              onClick={() => setShowCreateRoom(true)}
              className="bg-gradient-to-r from-theme-primary to-theme-secondary hover:opacity-90 text-white font-semibold rounded-lg px-6 py-3 shadow-md hover:shadow-lg transition-all duration-150"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Workspace
            </Button>
          </div>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme-primary"></div>
            <span className="ml-3 text-theme-gray-light">Loading workspaces...</span>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {rooms.length === 0 ? 'No workspaces yet' : 'No matching workspaces'}
            </h3>
            <p className="text-theme-gray-light mb-6">
              {rooms.length === 0 
                ? 'Create your first workspace to start collaborating' 
                : 'Try adjusting your search query'
              }
            </p>
            {rooms.length === 0 && (
              <Button
                onClick={() => setShowCreateRoom(true)}
                className="bg-gradient-to-r from-theme-primary to-theme-secondary hover:opacity-90 text-white font-semibold rounded-lg px-6 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Workspace
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="bg-dark-secondary border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-200 hover:shadow-lg cursor-pointer group"
                onClick={() => handleJoinRoom(room._id)}
              >
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs text-theme-gray-light bg-dark/50 px-2 py-1 rounded">
                    {room.roomCode}
                  </div>
                </div>

                {/* Room Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-theme-primary transition-colors">
                    {room.name}
                  </h3>
                  {room.description && (
                    <p className="text-theme-gray-light text-sm line-clamp-2 mb-2">
                      {room.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-theme-gray-light">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {room.dashboardName}
                  </div>
                </div>

                {/* Room Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center text-sm text-theme-gray-light">
                    <Users className="w-4 h-4 mr-1" />
                    {room.invitedPeople?.length || 0} members
                  </div>
                  <div className="flex items-center text-xs text-theme-gray-light">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(room.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoom onClose={() => setShowCreateRoom(false)} />
      )}

      {/* Join Room Modal */}
      {showJoinRoom && (
        <JoinRoom onClose={() => setShowJoinRoom(false)} />
      )}
    </div>
  );
}
