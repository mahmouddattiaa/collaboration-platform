import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  LogOut, 
  Users, 
  Search,
  Home,
  Briefcase,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Activity,
  Star,
  Sparkles,
  Calendar,
  BarChart3,
  ArrowRight,
  Rocket,
  Trophy,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
  FileText,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateRoom } from '@/components/room/CreateRoom';
import { JoinRoom } from '@/components/room/JoinRoom';
import { useAuth } from '@/hooks/useAuth';
import { useRoom } from '@/hooks/useRoom';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { user, logout } = useAuth();
  const { rooms, isLoading, getUserRooms } = useRoom();
  const { projects, isLoading: projectsLoading, getProjectsForUser } = useProjects();
  const navigate = useNavigate();

  // Load user's rooms when dashboard mounts
  useEffect(() => {
    getUserRooms();
  }, [getUserRooms]);

  // Load projects when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0) {
      getProjectsForUser(rooms);
    }
  }, [rooms, getProjectsForUser]);

  // Calculate stats
  const stats = {
    totalRooms: rooms.length,
    activeToday: rooms.filter(r => {
      const lastActive = new Date(r.createdAt);
      const today = new Date();
      return lastActive.toDateString() === today.toDateString();
    }).length,
    totalMembers: rooms.reduce((sum, r) => sum + (r.invitedPeople?.length || 0), 0),
    recentActivity: rooms.filter(r => {
      const created = new Date(r.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length
  };

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
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-secondary to-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="bg-dark/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-75 animate-pulse" />
                <div className="relative w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Collaboration Hub</h1>
                <p className="text-xs text-white/60">Build. Collaborate. Succeed.</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">{user?.name}</span>
                  <span className="text-white/40 text-xs">{user?.email}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Hero Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome back, {user?.name}!
                </span>
                <Rocket className="w-8 h-8 text-yellow-400 animate-bounce" />
              </h2>
              <p className="text-white/60 text-lg">
                Let's make today productive and collaborative! 🚀
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-white/60 text-sm mb-1">Total Workspaces</p>
              <p className="text-3xl font-bold text-white">{stats.totalRooms}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white/60 text-sm mb-1">Active Today</p>
              <p className="text-3xl font-bold text-white">{stats.activeToday}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white/60 text-sm mb-1">Team Members</p>
              <p className="text-3xl font-bold text-white">{stats.totalMembers}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white/60 text-sm mb-1">This Week</p>
              <p className="text-3xl font-bold text-white">{stats.recentActivity}</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-green-400 transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces by name, description..."
              className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 focus:bg-white/10 transition-all h-12"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-lg transition-all",
                viewMode === 'grid' 
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <PieChart className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-lg transition-all",
                viewMode === 'list' 
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Create Room Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowJoinRoom(true)}
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white rounded-xl px-6 h-12 transition-all duration-300 hover:scale-105 hover:border-blue-500/50"
            >
              <Users className="w-5 h-5 mr-2" />
              Join
            </Button>
            <Button
              onClick={() => setShowCreateRoom(true)}
              className="relative overflow-hidden bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl px-8 h-12 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">New Workspace</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        {rooms.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-white/80 text-sm">
                  <span className="font-bold text-white">{filteredRooms.length}</span> workspace{filteredRooms.length !== 1 ? 's' : ''} found
                </span>
              </div>
              {searchQuery && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Filtering by: "{searchQuery}"
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Rooms Grid */}
        <h2 className="text-3xl font-bold text-white mb-6">Workspaces</h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="w-6 h-6 text-green-400 animate-pulse" />
              </div>
            </div>
            <span className="mt-6 text-white/60 text-lg">Loading your workspaces...</span>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">
              {rooms.length === 0 ? 'No workspaces yet!' : 'No matching workspaces'}
            </h3>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
              {rooms.length === 0 
                ? 'Start your collaboration journey by creating your first workspace' 
                : 'Try adjusting your search query or clear filters'
              }
            </p>
            {rooms.length === 0 && (
              <Button
                onClick={() => setShowCreateRoom(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl px-10 py-6 text-lg shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-6 h-6 mr-3" />
                Create Your First Workspace
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(
            "gap-6 mb-12",
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
          )}>
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                onMouseEnter={() => setHoveredRoom(room._id)}
                onMouseLeave={() => setHoveredRoom(null)}
                className={cn(
                  "group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500",
                  hoveredRoom === room._id 
                    ? "scale-105 shadow-2xl border-green-500/50 shadow-green-500/20" 
                    : "hover:border-white/20",
                  viewMode === 'list' && "flex items-center"
                )}
                onClick={() => handleJoinRoom(room._id)}
              >
                {/* Gradient overlay on hover */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 transition-opacity duration-500",
                  hoveredRoom === room._id && "opacity-100"
                )} />

                <div className={cn("relative p-6", viewMode === 'list' && "flex items-center gap-6 flex-1")}>
                  {/* Room Header */}
                  <div className={cn(
                    "flex items-start justify-between mb-4",
                    viewMode === 'list' && "mb-0 flex-shrink-0"
                  )}>
                    <div className="relative">
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-50 transition-opacity duration-300",
                        hoveredRoom === room._id && "opacity-100"
                      )} />
                      <div className="relative w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Home className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    {viewMode === 'grid' && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1 text-xs font-mono">
                        {room.roomCode}
                      </Badge>
                    )}
                  </div>

                  {/* Room Content */}
                  <div className={cn("mb-4 flex-1", viewMode === 'list' && "mb-0")}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
                        {room.name}
                      </h3>
                      {viewMode === 'list' && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-2 py-1 text-xs font-mono">
                          {room.roomCode}
                        </Badge>
                      )}
                    </div>
                    {room.description && (
                      <p className="text-white/60 text-sm line-clamp-2 mb-3">
                        {room.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {room.dashboardName}
                      </Badge>
                    </div>
                  </div>

                  {/* Room Footer */}
                  <div className={cn(
                    "flex items-center justify-between pt-4 border-t border-white/10",
                    viewMode === 'list' && "border-t-0 border-l pl-6"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="font-medium">{room.invitedPeople?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Calendar className="w-4 h-4" />
                        {new Date(room.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      Open
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        <h2 className="text-3xl font-bold text-white mb-6">Projects</h2>
        {projectsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Briefcase className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
            </div>
            <span className="mt-6 text-white/60 text-lg">Loading your projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No projects found.</h3>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
              Create a project inside a workspace to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:scale-105"
              >
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1 text-xs">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-white/60 text-sm line-clamp-2">
                      {project.description || 'No description available.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="w-4 h-4" />
                      <span>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${project.priority === 'high' ? 'bg-red-500' : project.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <span className="text-white/70">{project.priority}</span>
                    </div>
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
