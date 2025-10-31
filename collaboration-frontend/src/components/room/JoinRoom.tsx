import { Home, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useRoom } from '@/hooks/useRoom';

export function JoinRoom({ onClose }:{onClose?: () => void}){
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');

    const { joinRoom, isLoading } = useRoom();
    const navigate = useNavigate();

    const handleSubmit =async(e: React.FormEvent) => {
        e.preventDefault();

        if(!roomCode){
            setError('Room Code is required');
            return;
        }

        const result = await joinRoom(roomCode);

        if(result.success && result.room){
            navigate(`/room/${result.room._id}`, { 
                state: { room: result.room } 
            });
            onClose?.();
        }
        else{
            setError(result.message);
        }
    };
    
    return(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-dark-secondary rounded-xl shadow-2xl w-full max-w-md p-8 space-y-8 border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-3xl font-semibold text-white">Join Workspace</h2>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Room Code Input */}
                    <div>
                        <label htmlFor="roomCode" className="block text-sm font-medium mb-2 text-theme-gray-light">
                            Workspace Code
                        </label>
                        <div className="relative">
                            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="roomCode"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="Enter workspace code (e.g., ABC123)"
                                required
                                className="bg-dark border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary"
                                maxLength={6}
                            />
                        </div>
                        <p className="text-xs text-theme-gray-light mt-1">
                            Ask the workspace owner for the 6-character code
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 py-3 border-white/20 hover:bg-white/10 text-white rounded-lg transition-colors duration-150"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 py-3 bg-gradient-to-r from-theme-primary to-theme-secondary hover:opacity-90 text-white font-semibold rounded-lg transition-opacity duration-150 shadow-md hover:shadow-lg"
                            disabled={isLoading || !roomCode.trim()}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                    Joining...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Join Workspace
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}     
