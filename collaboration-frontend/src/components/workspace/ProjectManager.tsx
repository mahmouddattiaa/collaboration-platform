// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, Target, Calendar, Users, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Play, Pause, Archive, Filter, Search,
  Star, Flag, Zap, Award, Activity, BarChart3, Folder, Tag, List, ChevronDown,
  ChevronRight, Circle, CheckCircle2, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Requirement {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: string;
}

interface Phase {
  id: number;
  name: string;
  description: string;
  requirements: Requirement[];
  status: 'not-started' | 'in-progress' | 'completed';
  order: number;
  startDate?: string;
  endDate?: string;
}

interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate: string;
  dueDate: string;
  teamMembers: TeamMember[];
  milestones: Milestone[];
  phases: Phase[];
  tags: string[];
  createdAt: string;
  starred: boolean;
}

interface ProjectManagerProps {
  roomId: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ roomId }) => {
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [starredProjects, setStarredProjects] = useState<Set<number>>(new Set());

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectDueDate, setNewProjectDueDate] = useState('');
  const [newProjectTags, setNewProjectTags] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Project['status']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Project['priority']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'progress' | 'name'>('date');

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem(`projects-${roomId}`);
    const savedStarred = localStorage.getItem(`projects-starred-${roomId}`);
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    if (savedStarred) {
      setStarredProjects(new Set(JSON.parse(savedStarred)));
    }
  }, [roomId]);

  // Save projects to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(`projects-${roomId}`, JSON.stringify(projects));
    } else {
      localStorage.removeItem(`projects-${roomId}`);
    }
  }, [projects, roomId]);

  // Save starred projects
  useEffect(() => {
    if (starredProjects.size > 0) {
      localStorage.setItem(`projects-starred-${roomId}`, JSON.stringify([...starredProjects]));
    } else {
      localStorage.removeItem(`projects-starred-${roomId}`);
    }
  }, [starredProjects, roomId]);

  // Create or update project
  const handleSaveProject = useCallback(() => {
    if (!newProjectName.trim()) return;

    const tagsArray = newProjectTags.split(',').map(t => t.trim()).filter(t => t);

    if (editingProjectId !== null) {
      // Update existing project
      setProjects(prev => prev.map(project =>
        project.id === editingProjectId
          ? {
              ...project,
              name: newProjectName,
              description: newProjectDescription,
              priority: newProjectPriority,
              startDate: newProjectStartDate,
              dueDate: newProjectDueDate,
              tags: tagsArray
            }
          : project
      ));
      setEditingProjectId(null);
    } else {
      // Create new project
      const newProject: Project = {
        id: Date.now(),
        name: newProjectName,
        description: newProjectDescription,
        status: 'planning',
        priority: newProjectPriority,
        progress: 0,
        startDate: newProjectStartDate || new Date().toISOString().split('T')[0],
        dueDate: newProjectDueDate,
        teamMembers: [],
        milestones: [],
        phases: [],
        tags: tagsArray,
        createdAt: new Date().toLocaleString(),
        starred: false
      };
      setProjects(prev => [newProject, ...prev]);
    }

    // Reset form
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectPriority('medium');
    setNewProjectStartDate('');
    setNewProjectDueDate('');
    setNewProjectTags('');
    setShowCreateForm(false);
  }, [newProjectName, newProjectDescription, newProjectPriority, newProjectStartDate, newProjectDueDate, newProjectTags, editingProjectId]);

  // Delete project
  const handleDeleteProject = useCallback((projectId: number) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setStarredProjects(prev => {
      const newSet = new Set(prev);
      newSet.delete(projectId);
      return newSet;
    });
  }, []);

  // Toggle project star
  const handleToggleStar = useCallback((projectId: number) => {
    setStarredProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  }, []);

  // Update project status
  const handleUpdateStatus = useCallback((projectId: number, newStatus: Project['status']) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, status: newStatus } : project
    ));
  }, []);

  // Update project progress
  const handleUpdateProgress = useCallback((projectId: number, newProgress: number) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, progress: Math.min(100, Math.max(0, newProgress)) } : project
    ));
  }, []);

  // Add milestone
  const handleAddMilestone = useCallback((projectId: number, milestoneTitle: string, dueDate: string) => {
    if (!milestoneTitle.trim()) return;
    
    const newMilestone: Milestone = {
      id: Date.now(),
      title: milestoneTitle,
      completed: false,
      dueDate: dueDate
    };

    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, milestones: [...project.milestones, newMilestone] }
        : project
    ));
  }, []);

  // Toggle milestone completion
  const handleToggleMilestone = useCallback((projectId: number, milestoneId: number) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            milestones: project.milestones.map(m =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            )
          }
        : project
    ));
  }, []);

  // Edit project
  const handleEditProject = useCallback((project: Project) => {
    setEditingProjectId(project.id);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description);
    setNewProjectPriority(project.priority);
    setNewProjectStartDate(project.startDate);
    setNewProjectDueDate(project.dueDate);
    setNewProjectTags(project.tags.join(', '));
    setShowCreateForm(true);
  }, []);

  // === PHASE MANAGEMENT ===
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [selectedProjectForPhases, setSelectedProjectForPhases] = useState<number | null>(null);

  // Add new phase to project
  const handleAddPhase = useCallback((projectId: number, phaseName: string, phaseDescription: string) => {
    if (!phaseName.trim()) return;

    const newPhase: Phase = {
      id: Date.now(),
      name: phaseName,
      description: phaseDescription,
      requirements: [],
      status: 'not-started',
      order: 0
    };

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const phases = [...project.phases, { ...newPhase, order: project.phases.length }];
        return { ...project, phases };
      }
      return project;
    }));
  }, []);

  // Delete phase
  const handleDeletePhase = useCallback((projectId: number, phaseId: number) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const phases = project.phases
          .filter(p => p.id !== phaseId)
          .map((p, index) => ({ ...p, order: index }));
        return { ...project, phases };
      }
      return project;
    }));
  }, []);

  // Update phase status
  const handleUpdatePhaseStatus = useCallback((projectId: number, phaseId: number, status: Phase['status']) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const phases = project.phases.map(p =>
          p.id === phaseId ? { ...p, status } : p
        );
        return { ...project, phases };
      }
      return project;
    }));
  }, []);

  // Add requirement to phase
  const handleAddRequirement = useCallback((projectId: number, phaseId: number, requirement: Partial<Requirement>) => {
    if (!requirement.title?.trim()) return;

    const newRequirement: Requirement = {
      id: Date.now(),
      title: requirement.title,
      description: requirement.description || '',
      completed: false,
      priority: requirement.priority || 'medium',
      assignedTo: requirement.assignedTo,
      dueDate: requirement.dueDate
    };

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const phases = project.phases.map(phase => {
          if (phase.id === phaseId) {
            return {
              ...phase,
              requirements: [...phase.requirements, newRequirement]
            };
          }
          return phase;
        });
        return { ...project, phases };
      }
      return project;
    }));
  }, []);

  // Toggle requirement completion
  const handleToggleRequirement = useCallback((projectId: number, phaseId: number, requirementId: number) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const phases = project.phases.map(phase => {
          if (phase.id === phaseId) {
            const requirements = phase.requirements.map(req =>
              req.id === requirementId ? { ...req, completed: !req.completed } : req
            );
            
            // Auto-update phase status based on requirements
            const allCompleted = requirements.every(r => r.completed);
            const anyInProgress = requirements.some(r => r.completed);
            const newPhaseStatus = allCompleted ? 'completed' : (anyInProgress ? 'in-progress' : 'not-started');
            
            return {
              ...phase,
              requirements,
              status: newPhaseStatus
            };
          }
          return phase;
        });
        
        // Calculate overall project progress
        const totalRequirements = phases.reduce((sum, p) => sum + p.requirements.length, 0);
        const completedRequirements = phases.reduce((sum, p) => 
          sum + p.requirements.filter(r => r.completed).length, 0
        );
        const progress = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
        
        return { ...project, phases, progress };
      }
      return project;
    }));
  }, []);

  // Delete requirement
  const handleDeleteRequirement = useCallback((projectId: number, phaseId: number, requirementId: number) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const phases = project.phases.map(phase => {
          if (phase.id === phaseId) {
            return {
              ...phase,
              requirements: phase.requirements.filter(r => r.id !== requirementId)
            };
          }
          return phase;
        });
        return { ...project, phases };
      }
      return project;
    }));
  }, []);

  // Toggle phase expansion
  const togglePhaseExpansion = useCallback((phaseId: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  }, []);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(p => p.priority === filterPriority);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'progress':
          return b.progress - a.progress;
        case 'date':
        default:
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });

    return filtered;
  }, [projects, searchQuery, filterStatus, filterPriority, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      planning: projects.filter(p => p.status === 'planning').length,
      paused: projects.filter(p => p.status === 'paused').length,
      starred: starredProjects.size,
      critical: projects.filter(p => p.priority === 'critical' && p.status !== 'completed').length,
      avgProgress: projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0
    };
  }, [projects, starredProjects]);

  // Status config
  const statusConfig = {
    planning: { label: 'Planning', icon: Folder, color: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    active: { label: 'Active', icon: Play, color: 'green', bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
    paused: { label: 'Paused', icon: Pause, color: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    archived: { label: 'Archived', icon: Archive, color: 'gray', bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400' }
  };

  // Priority config
  const priorityConfig = {
    low: { label: 'Low', icon: Flag, color: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    medium: { label: 'Medium', icon: Flag, color: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    high: { label: 'High', icon: Flag, color: 'orange', bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
    critical: { label: 'Critical', icon: Zap, color: 'red', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg blur-lg opacity-50 animate-pulse" />
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Project Tracker
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Create, track, and manage your projects with milestones and team collaboration
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-xs text-white/60">Total Projects</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-xs text-white/60">Active</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-emerald-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.completed}</span>
          </div>
          <p className="text-xs text-white/60">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.planning}</span>
          </div>
          <p className="text-xs text-white/60">Planning</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-xl border border-yellow-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.paused}</span>
          </div>
          <p className="text-xs text-white/60">Paused</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-xl border border-amber-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.starred}</span>
          </div>
          <p className="text-xs text-white/60">Starred</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-xl border border-red-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.critical}</span>
          </div>
          <p className="text-xs text-white/60">Critical</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.avgProgress}%</span>
          </div>
          <p className="text-xs text-white/60">Avg Progress</p>
        </div>
      </div>

      {/* Create Project Button */}
      {!showCreateForm && (
        <Button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg shadow-green-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </Button>
      )}

      {/* Create/Edit Project Form */}
      {showCreateForm && (
        <div className="bg-gradient-to-br from-dark-secondary/80 to-dark/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              {editingProjectId ? 'Edit Project' : 'Create New Project'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateForm(false);
                setEditingProjectId(null);
                setNewProjectName('');
                setNewProjectDescription('');
                setNewProjectPriority('medium');
                setNewProjectStartDate('');
                setNewProjectDueDate('');
                setNewProjectTags('');
              }}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Project Name *</label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="bg-dark/50 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Description</label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Describe your project..."
                className="w-full bg-dark/50 text-white placeholder:text-white/30 border border-white/10 rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Priority</label>
                <select
                  value={newProjectPriority}
                  onChange={(e) => setNewProjectPriority(e.target.value as Project['priority'])}
                  className="w-full bg-dark/50 text-white border border-white/10 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white/80 mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={newProjectTags}
                  onChange={(e) => setNewProjectTags(e.target.value)}
                  placeholder="design, development, marketing"
                  className="bg-dark/50 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={newProjectStartDate}
                  onChange={(e) => setNewProjectStartDate(e.target.value)}
                  className="bg-dark/50 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={newProjectDueDate}
                  onChange={(e) => setNewProjectDueDate(e.target.value)}
                  className="bg-dark/50 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveProject}
                disabled={!newProjectName.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingProjectId ? 'Update Project' : 'Create Project'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingProjectId(null);
                  setNewProjectName('');
                  setNewProjectDescription('');
                  setNewProjectPriority('medium');
                  setNewProjectStartDate('');
                  setNewProjectDueDate('');
                  setNewProjectTags('');
                }}
                className="border-white/10 text-white/60 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="pl-10 bg-dark-secondary/50 border-white/10 text-white placeholder:text-white/40 text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 sm:flex-none bg-dark-secondary/50 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="flex-1 sm:flex-none bg-dark-secondary/50 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 sm:flex-none bg-dark-secondary/50 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <Target className="w-16 h-16 sm:w-20 sm:h-20 mx-auto opacity-20 relative z-10" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
          </h3>
          <p className="text-sm sm:text-base text-white/40">
            {projects.length === 0
              ? 'Create your first project to start tracking progress'
              : 'Try adjusting your filters or search terms'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredProjects.map((project) => {
            const isStarred = starredProjects.has(project.id);
            const statusCfg = statusConfig[project.status];
            const priorityCfg = priorityConfig[project.priority];
            const StatusIcon = statusCfg.icon;
            const PriorityIcon = priorityCfg.icon;

            return (
              <div
                key={project.id}
                className={cn(
                  'bg-gradient-to-br from-dark-secondary/80 to-dark/50 backdrop-blur-xl border rounded-xl p-4 sm:p-5',
                  'transition-all group hover:scale-[1.02] hover:shadow-2xl',
                  'border-white/10',
                  isStarred && 'ring-2 ring-amber-400/50'
                )}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{project.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStar(project.id)}
                        className={cn(
                          'h-7 w-7 p-0 transition-all',
                          isStarred ? 'text-amber-400' : 'text-white/40 opacity-0 group-hover:opacity-100'
                        )}
                      >
                        <Star className={cn('w-4 h-4', isStarred && 'fill-current')} />
                      </Button>
                    </div>
                    {project.description && (
                      <p className="text-sm text-white/60 mb-3 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-blue-400 hover:bg-blue-400/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={cn('text-xs', statusCfg.bg, statusCfg.border, statusCfg.text)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                  <Badge className={cn('text-xs', priorityCfg.bg, priorityCfg.border, priorityCfg.text)}>
                    <PriorityIcon className="w-3 h-3 mr-1" />
                    {priorityCfg.label}
                  </Badge>
                  {project.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-white/20 text-white/60">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">Progress</span>
                    <span className="text-sm font-semibold text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-dark/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(project.id, project.progress - 10)}
                      className="text-xs h-7 border-white/10 text-white/60"
                    >
                      -10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(project.id, project.progress + 10)}
                      className="text-xs h-7 border-white/10 text-white/60"
                    >
                      +10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(project.id, 100)}
                      className="text-xs h-7 border-white/10 text-green-400"
                    >
                      Complete
                    </Button>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 mb-4 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Start: {project.startDate || 'Not set'}</span>
                  </div>
                  {project.dueDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Due: {project.dueDate}</span>
                    </div>
                  )}
                </div>

                {/* Milestones */}
                {project.milestones.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-white/60 mb-2 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Milestones ({project.milestones.filter(m => m.completed).length}/{project.milestones.length})
                    </div>
                    <div className="space-y-1">
                      {project.milestones.slice(0, 3).map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <button
                            onClick={() => handleToggleMilestone(project.id, milestone.id)}
                            className={cn(
                              'w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0',
                              milestone.completed
                                ? 'bg-green-500/20 border-green-500/50'
                                : 'bg-dark/50 border-white/20'
                            )}
                          >
                            {milestone.completed && <CheckCircle className="w-3 h-3 text-green-400" />}
                          </button>
                          <span className={cn('flex-1', milestone.completed && 'line-through text-white/40')}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* === PHASES SECTION === */}
                {project.phases && project.phases.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <div className="text-xs text-white/60 mb-2 flex items-center gap-2">
                      <Layers className="w-3 h-3" />
                      <span>Phases ({project.phases.filter(p => p.status === 'completed').length}/{project.phases.length} completed)</span>
                    </div>
                    {project.phases.map((phase) => {
                      const isExpanded = expandedPhases.has(phase.id);
                      const completedReqs = phase.requirements.filter(r => r.completed).length;
                      const totalReqs = phase.requirements.length;
                      const phaseProgress = totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0;
                      
                      return (
                        <div key={phase.id} className="bg-dark/30 rounded-lg border border-white/5 overflow-hidden">
                          {/* Phase Header */}
                          <div 
                            className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => togglePhaseExpansion(phase.id)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                              )}
                              <span className="font-medium text-sm text-white flex-1">{phase.name}</span>
                              <Badge className={cn(
                                'text-xs px-2 py-0',
                                phase.status === 'completed' && 'bg-green-500/20 text-green-400 border-green-500/30',
                                phase.status === 'in-progress' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                                phase.status === 'not-started' && 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              )}>
                                {phase.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {phase.status === 'in-progress' && <Activity className="w-3 h-3 mr-1" />}
                                {phase.status === 'not-started' && <Circle className="w-3 h-3 mr-1" />}
                                {phase.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            {phase.description && (
                              <p className="text-xs text-white/50 ml-6">{phase.description}</p>
                            )}
                            <div className="flex items-center gap-2 ml-6 mt-2">
                              <div className="flex-1 bg-dark/50 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                                  style={{ width: `${phaseProgress}%` }}
                                />
                              </div>
                              <span className="text-xs text-white/40">{completedReqs}/{totalReqs}</span>
                            </div>
                          </div>

                          {/* Phase Requirements (Expanded) */}
                          {isExpanded && (
                            <div className="px-3 pb-3 space-y-2">
                              {phase.requirements.map((req) => (
                                <div 
                                  key={req.id}
                                  className="flex items-start gap-2 p-2 bg-dark/20 rounded border border-white/5 hover:border-white/10 transition-colors"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleRequirement(project.id, phase.id, req.id);
                                    }}
                                    className={cn(
                                      'mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0',
                                      req.completed
                                        ? 'bg-green-500/20 border-green-500/50'
                                        : 'bg-dark/50 border-white/20 hover:border-white/40'
                                    )}
                                  >
                                    {req.completed && <CheckCircle className="w-3 h-3 text-green-400" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={cn(
                                        'text-xs text-white flex-1',
                                        req.completed && 'line-through text-white/40'
                                      )}>
                                        {req.title}
                                      </span>
                                      {req.priority && req.priority !== 'medium' && (
                                        <Badge className={cn(
                                          'text-[10px] px-1.5 py-0',
                                          req.priority === 'critical' && 'bg-red-500/20 text-red-400 border-red-500/30',
                                          req.priority === 'high' && 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                                          req.priority === 'low' && 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        )}>
                                          {req.priority}
                                        </Badge>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRequirement(project.id, phase.id, req.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                    {req.description && (
                                      <p className="text-[10px] text-white/40 mb-1">{req.description}</p>
                                    )}
                                    {(req.assignedTo || req.dueDate) && (
                                      <div className="flex items-center gap-2 text-[10px] text-white/30">
                                        {req.assignedTo && <span>👤 {req.assignedTo}</span>}
                                        {req.dueDate && <span>📅 {req.dueDate}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add New Requirement */}
                              <AddRequirementForm 
                                projectId={project.id}
                                phaseId={phase.id}
                                onAdd={handleAddRequirement}
                              />
                              
                              {/* Phase Actions */}
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (phase.status !== 'in-progress') {
                                      handleUpdatePhaseStatus(project.id, phase.id, 'in-progress');
                                    }
                                  }}
                                  className="text-[10px] px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded border border-blue-500/20 transition-colors"
                                >
                                  Start Phase
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhase(project.id, phase.id);
                                  }}
                                  className="text-[10px] px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/20 transition-colors"
                                >
                                  Delete Phase
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add New Phase Button */}
                <div className="mb-4">
                  <AddPhaseForm 
                    projectId={project.id}
                    onAdd={handleAddPhase}
                  />
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {project.status !== 'active' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(project.id, 'active')}
                      className="text-xs h-7 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {project.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(project.id, 'paused')}
                      className="text-xs h-7 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  {project.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleUpdateStatus(project.id, 'completed');
                        handleUpdateProgress(project.id, 100);
                      }}
                      className="text-xs h-7 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(project.id, 'archived')}
                    className="text-xs h-7 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30"
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    Archive
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper Component: Add Phase Form
const AddPhaseForm: React.FC<{
  projectId: number;
  onAdd: (projectId: number, name: string, description: string) => void;
}> = ({ projectId, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(projectId, name.trim(), description.trim());
      setName('');
      setDescription('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsAdding(true)}
        className="w-full text-xs h-8 border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Phase
      </Button>
    );
  }

  return (
    <div className="bg-dark/30 rounded-lg border border-white/10 p-3 space-y-2">
      <Input
        placeholder="Phase name (e.g., Planning, Development, Testing)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-dark/50 border-white/10 text-white text-xs h-8"
        autoFocus
      />
      <Input
        placeholder="Phase description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-dark/50 border-white/10 text-white text-xs h-8"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xs h-7"
        >
          <Save className="w-3 h-3 mr-1" />
          Add
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setIsAdding(false);
            setName('');
            setDescription('');
          }}
          className="border-white/10 text-white/60 text-xs h-7"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// Helper Component: Add Requirement Form
const AddRequirementForm: React.FC<{
  projectId: number;
  phaseId: number;
  onAdd: (projectId: number, phaseId: number, requirement: Partial<Requirement>) => void;
}> = ({ projectId, phaseId, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(projectId, phaseId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedTo: assignedTo.trim() || undefined,
        dueDate: dueDate || undefined
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignedTo('');
      setDueDate('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full text-left p-2 bg-dark/10 hover:bg-dark/20 rounded border border-dashed border-white/10 hover:border-white/20 transition-colors"
      >
        <span className="text-xs text-white/40 flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add requirement
        </span>
      </button>
    );
  }

  return (
    <div className="bg-dark/40 rounded border border-white/10 p-2 space-y-2">
      <Input
        placeholder="Requirement title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-dark/50 border-white/10 text-white text-xs h-7"
        autoFocus
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-dark/50 border-white/10 text-white text-xs h-7"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="bg-dark/50 text-white border border-white/10 rounded px-2 py-1 text-xs"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-dark/50 border-white/10 text-white text-xs h-7"
        />
      </div>
      <Input
        placeholder="Assigned to (optional)"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="bg-dark/50 border-white/10 text-white text-xs h-7"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-xs h-6"
        >
          <Save className="w-3 h-3 mr-1" />
          Add
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setIsAdding(false);
            setTitle('');
            setDescription('');
          }}
          className="border-white/10 text-white/60 text-xs h-6"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

