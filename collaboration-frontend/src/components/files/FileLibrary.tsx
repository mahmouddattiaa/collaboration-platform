import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Trash2, Upload, Download, File, Image, Music, Video, 
  MoreVertical, RotateCcw, FileIcon, Search, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { roomService } from '@/services/roomService';
import { useAuth } from '@/hooks/useAuth';

interface FileItem {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  deletedAt?: string;
}

export function FileLibrary({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'files' | 'trash'>('files');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const data = await roomService.getFiles(roomId, token, activeTab === 'trash');
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [roomId, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB Limit check (client side)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large (Max 5MB)');
      return;
    }

    const toastId = toast.loading('Uploading file...');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token');

      await roomService.uploadFile(roomId, file, token);
      toast.success('File uploaded successfully', { id: toastId });
      fetchFiles();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload file', { id: toastId });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      if (activeTab === 'files') {
        await roomService.deleteFile(fileId, token);
        toast.success('File moved to trash');
      } else {
        if (confirm('Permanently delete this file? This cannot be undone.')) {
          await roomService.permanentlyDeleteFile(fileId, token);
          toast.success('File permanently deleted');
        } else {
          return;
        }
      }
      setFiles(prev => prev.filter(f => f._id !== fileId));
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleRestore = async (fileId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await roomService.restoreFile(fileId, token);
      toast.success('File restored');
      setFiles(prev => prev.filter(f => f._id !== fileId));
    } catch (error) {
      toast.error('Failed to restore file');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-400" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-400" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-400" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => 
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-dark/30 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-dark-secondary/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">File Library</h2>
            <p className="text-white/60 text-sm">Manage your project files and assets</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'files' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'trash' 
                  ? 'bg-red-500/20 text-red-400 shadow-sm' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trash2 className="w-3 h-3" />
              Trash
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-9 bg-black/20 border-white/10 h-9 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-white/40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Loading files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16 text-white/40 border-2 border-dashed border-white/5 rounded-xl">
            <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">No files found</p>
            <p className="text-sm">
              {activeTab === 'files' 
                ? 'Upload a file to get started' 
                : 'Trash is empty'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div 
                key={file._id}
                className="group relative bg-dark-secondary/40 hover:bg-dark-secondary/60 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-black/20 rounded-lg">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {activeTab === 'trash' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(file._id)}
                        className="h-7 w-7 p-0 text-green-400 hover:bg-green-500/10"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        className="h-7 w-7 p-0 text-blue-400 hover:bg-blue-500/10"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file._id)}
                      className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10"
                      title={activeTab === 'trash' ? "Delete Permanently" : "Move to Trash"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-white truncate" title={file.originalName}>
                    {file.originalName}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span>{formatSize(file.size)}</span>
                    <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/5 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[8px] text-white font-bold">
                      {file.uploadedBy?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-xs text-white/60 truncate">
                      {file.uploadedBy?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
