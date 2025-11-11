// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, Target, Calendar, Users, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Play, Pause, Archive, Filter, Search,
  Star, Flag, Zap, Award, Activity, BarChart3, Folder, Tag, List, ChevronDown,
  ChevronRight, Circle, CheckCircle2, Layers, DollarSign, AlertTriangle,
  Link2, MessageSquare, Paperclip, TrendingDown, Timer, User, GitBranch,
  Eye, EyeOff, MoreVertical, Download, Upload, Share2, FileText, Image,
  ChevronLeft, ChevronUp
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
  estimatedHours?: number;
  actualHours?: number;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  dependencies?: number[]; // IDs of requirements this depends on
  tags?: string[];
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
  budget?: number;
  actualCost?: number;
}

interface Milestone {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  completedDate?: string;
  deliverables?: string[];
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  workload?: number; // 0-100%
  skills?: string[];
}

interface Risk {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
  owner?: string;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  edited?: boolean;
}

interface Attachment {
  id: number;
  name: string;
  type: 'file' | 'link';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  size?: number;
}

interface ActivityLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
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
  
  // Enhanced fields
  budget?: number;
  actualCost?: number;
  estimatedHours?: number;
  actualHours?: number;
  risks?: Risk[];
  issues?: Issue[];
  comments?: Comment[];
  attachments?: Attachment[];
  activityLog?: ActivityLog[];
  dependencies?: number[]; // IDs of projects this depends on
  client?: string;
  projectManager?: string;
  category?: string;
  objectives?: string[];
  successCriteria?: string[];
}

interface ProjectManagerProps {
  roomId: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ roomId }) => {
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [starredProjects, setStarredProjects] = useState<Set<number>>(new Set());

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [detailViewTab, setDetailViewTab] = useState<'overview' | 'tasks' | 'team' | 'budget' | 'risks' | 'timeline' | 'activity'>('overview');

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectDueDate, setNewProjectDueDate] = useState('');
  const [newProjectTags, setNewProjectTags] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectManager, setNewProjectManager] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('');

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
      const loadedProjects = JSON.parse(savedProjects);
      // Migrate old projects to include phases array
      const migratedProjects = loadedProjects.map((project: any) => ({
        ...project,
        phases: project.phases || []
      }));
      setProjects(migratedProjects);
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
    const currentUser = 'Current User'; // Get from auth context

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
              tags: tagsArray,
              budget: newProjectBudget ? parseFloat(newProjectBudget) : project.budget,
              client: newProjectClient || project.client,
              projectManager: newProjectManager || project.projectManager,
              category: newProjectCategory || project.category,
              activityLog: [
                ...(project.activityLog || []),
                {
                  id: Date.now(),
                  action: 'Project updated',
                  user: currentUser,
                  timestamp: new Date().toLocaleString(),
                  details: 'Project details were modified'
                }
              ]
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
        starred: false,
        budget: newProjectBudget ? parseFloat(newProjectBudget) : undefined,
        actualCost: 0,
        estimatedHours: 0,
        actualHours: 0,
        client: newProjectClient || undefined,
        projectManager: newProjectManager || undefined,
        category: newProjectCategory || undefined,
        risks: [],
        issues: [],
        comments: [],
        attachments: [],
        activityLog: [{
          id: Date.now(),
          action: 'Project created',
          user: currentUser,
          timestamp: new Date().toLocaleString()
        }],
        objectives: [],
        successCriteria: []
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
    setNewProjectBudget('');
    setNewProjectClient('');
    setNewProjectManager('');
    setNewProjectCategory('');
    setShowCreateForm(false);
  }, [newProjectName, newProjectDescription, newProjectPriority, newProjectStartDate, newProjectDueDate, newProjectTags, newProjectBudget, newProjectClient, newProjectManager, newProjectCategory, editingProjectId]);

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
    setNewProjectBudget(project.budget?.toString() || '');
    setNewProjectClient(project.client || '');
    setNewProjectManager(project.projectManager || '');
    setNewProjectCategory(project.category || '');
    setShowCreateForm(true);
  }, []);

  // Add team member
  const handleAddTeamMember = useCallback((projectId: number, member: Omit<TeamMember, 'id'>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            teamMembers: [...project.teamMembers, { ...member, id: Date.now() }]
          }
        : project
    ));
  }, []);

  // Add risk
  const handleAddRisk = useCallback((projectId: number, risk: Omit<Risk, 'id'>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            risks: [...(project.risks || []), { ...risk, id: Date.now() }]
          }
        : project
    ));
  }, []);

  // Add issue
  const handleAddIssue = useCallback((projectId: number, issue: Omit<Issue, 'id' | 'createdAt'>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            issues: [...(project.issues || []), { ...issue, id: Date.now(), createdAt: new Date().toLocaleString() }]
          }
        : project
    ));
  }, []);

  // Add comment
  const handleAddComment = useCallback((projectId: number, content: string, author: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            comments: [...(project.comments || []), {
              id: Date.now(),
              author,
              content,
              timestamp: new Date().toLocaleString()
            }]
          }
        : project
    ));
  }, []);

  // Add attachment
  const handleAddAttachment = useCallback((projectId: number, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            attachments: [...(project.attachments || []), {
              ...attachment,
              id: Date.now(),
              uploadedAt: new Date().toLocaleString()
            }]
          }
        : project
    ));
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
        : 0,
      totalTeamMembers: projects.reduce((sum, p) => sum + (p.teamMembers?.length || 0), 0),
      openRisks: projects.reduce((sum, p) => sum + (p.risks?.filter(r => r.status !== 'resolved').length || 0), 0),
      openIssues: projects.reduce((sum, p) => sum + (p.issues?.filter(i => i.status !== 'closed').length || 0), 0)
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

  // Get selected project
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  // If a project is selected, show detailed view
  if (selectedProject) {
    return (
      <ProjectDetailView
        project={selectedProject}
        onClose={() => setSelectedProjectId(null)}
        onUpdate={(updated) => {
          setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        }}
        detailTab={detailViewTab}
        setDetailTab={setDetailViewTab}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg blur-lg opacity-50 animate-pulse" />
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Project Tracker
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Complete project management with tracking, budgets, risks, and team collaboration
              </p>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="hidden md:flex gap-1 bg-dark-secondary/50 rounded-lg p-1 border border-white/10">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className={cn(
                'h-8 px-3',
                viewMode === 'grid' && 'bg-green-500/20 text-green-400'
              )}
            >
              <Folder className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className={cn(
                'h-8 px-3',
                viewMode === 'list' && 'bg-green-500/20 text-green-400'
              )}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              onClick={() => setViewMode('timeline')}
              className={cn(
                'h-8 px-3',
                viewMode === 'timeline' && 'bg-green-500/20 text-green-400'
              )}
            >
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-xs text-white/60">Total Projects</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-xs text-white/60">Active</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-emerald-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.completed}</span>
          </div>
          <p className="text-xs text-white/60">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.totalTeamMembers}</span>
          </div>
          <p className="text-xs text-white/60">Team Members</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-xl border border-yellow-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.openRisks}</span>
          </div>
          <p className="text-xs text-white/60">Active Risks</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-xl border border-amber-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.starred}</span>
          </div>
          <p className="text-xs text-white/60">Starred</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-xl border border-red-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            <span className="text-lg sm:text-2xl font-bold text-white">{stats.openIssues}</span>
          </div>
          <p className="text-xs text-white/60">Open Issues</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer">
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
                setNewProjectBudget('');
                setNewProjectClient('');
                setNewProjectManager('');
                setNewProjectCategory('');
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
                <label className="text-sm text-white/80 mb-2 block">Category</label>
                <Input
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value)}
                  placeholder="e.g., Web Development, Design..."
                  className="bg-dark/50 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Client</label>
                <Input
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  placeholder="Client or stakeholder name"
                  className="bg-dark/50 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 mb-2 block">Project Manager</label>
                <Input
                  value={newProjectManager}
                  onChange={(e) => setNewProjectManager(e.target.value)}
                  placeholder="Who's managing this project?"
                  className="bg-dark/50 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Budget ($)</label>
                <Input
                  type="number"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(e.target.value)}
                  placeholder="0.00"
                  className="bg-dark/50 border-white/10 text-white placeholder:text-white/30"
                />
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
                  setNewProjectBudget('');
                  setNewProjectClient('');
                  setNewProjectManager('');
                  setNewProjectCategory('');
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
                  'transition-all group hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
                  'border-white/10',
                  isStarred && 'ring-2 ring-amber-400/50'
                )}
                onClick={() => setSelectedProjectId(project.id)}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{project.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(project.id);
                        }}
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
                    
                    {/* Enhanced metadata */}
                    <div className="flex flex-wrap gap-2 text-xs text-white/50">
                      {project.client && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{project.client}</span>
                        </div>
                      )}
                      {project.category && (
                        <div className="flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          <span>{project.category}</span>
                        </div>
                      )}
                      {project.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-blue-400 hover:bg-blue-400/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
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
                {project.phases && Array.isArray(project.phases) && project.phases.length > 0 && (
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

                {/* Quick Stats Row */}
                <div className="flex items-center justify-between text-xs text-white/50 mb-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    {project.teamMembers && project.teamMembers.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{project.teamMembers.length} members</span>
                      </div>
                    )}
                    {project.risks && project.risks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        <span>{project.risks.filter(r => r.status !== 'resolved').length} risks</span>
                      </div>
                    )}
                    {project.issues && project.issues.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        <span>{project.issues.filter(i => i.status !== 'closed').length} issues</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-white/40">
                    <Eye className="w-3 h-3" />
                    <span>Click to view details</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {project.status !== 'active' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(project.id, 'active');
                      }}
                      className="text-xs h-7 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {project.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(project.id, 'paused');
                      }}
                      className="text-xs h-7 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  {project.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(project.id, 'archived');
                    }}
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

// ============================================================================
// PROJECT DETAIL VIEW COMPONENT
// ============================================================================
interface ProjectDetailViewProps {
  project: Project;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  detailTab: string;
  setDetailTab: (tab: string) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onClose,
  onUpdate,
  detailTab,
  setDetailTab
}) => {
  const [editingOverview, setEditingOverview] = useState(false);
  const [localProject, setLocalProject] = useState(project);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const handleSave = () => {
    onUpdate(localProject);
    setEditingOverview(false);
  };

  // Calculate project health
  const health = useMemo(() => {
    let score = 100;
    const openIssues = localProject.issues?.filter(i => i.status !== 'closed').length || 0;
    const criticalRisks = localProject.risks?.filter(r => r.severity === 'critical' && r.status !== 'resolved').length || 0;
    
    if (openIssues > 5) score -= 20;
    else if (openIssues > 2) score -= 10;
    
    if (criticalRisks > 0) score -= 30;
    
    const daysUntilDue = localProject.dueDate
      ? Math.ceil((new Date(localProject.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysUntilDue < 0) score -= 40;
    else if (daysUntilDue < 7 && localProject.progress < 80) score -= 20;
    
    if (localProject.budget && localProject.actualCost && localProject.actualCost > localProject.budget * 0.9) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }, [localProject]);

  const healthColor = health >= 80 ? 'text-green-400' : health >= 60 ? 'text-yellow-400' : 'text-red-400';
  const healthBg = health >= 80 ? 'bg-green-500/20' : health >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20';

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{localProject.name}</h2>
            <p className="text-sm text-white/60">{localProject.description}</p>
          </div>
        </div>
        
        {/* Health Score */}
        <div className={cn('px-4 py-2 rounded-lg border', healthBg)}>
          <div className="text-xs text-white/60">Project Health</div>
          <div className={cn('text-2xl font-bold', healthColor)}>{health}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: Target },
          { id: 'tasks', label: 'Tasks & Phases', icon: CheckCircle2 },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'budget', label: 'Budget & Time', icon: DollarSign },
          { id: 'risks', label: 'Risks & Issues', icon: AlertTriangle },
          { id: 'timeline', label: 'Timeline', icon: Calendar },
          { id: 'activity', label: 'Activity', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={detailTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setDetailTab(tab.id)}
              className={cn(
                'flex items-center gap-2',
                detailTab === tab.id && 'bg-green-500/20 text-green-400'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-dark-secondary/80 to-dark/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        {detailTab === 'overview' && (
          <OverviewTab project={localProject} onUpdate={setLocalProject} onSave={handleSave} />
        )}
        {detailTab === 'tasks' && (
          <TasksTab project={localProject} onUpdate={setLocalProject} onSave={handleSave} />
        )}
        {detailTab === 'team' && (
          <TeamTab project={localProject} onUpdate={setLocalProject} onSave={handleSave} />
        )}
        {detailTab === 'budget' && (
          <BudgetTab project={localProject} onUpdate={setLocalProject} onSave={handleSave} />
        )}
        {detailTab === 'risks' && (
          <RisksTab project={localProject} onUpdate={setLocalProject} onSave={handleSave} />
        )}
        {detailTab === 'timeline' && (
          <TimelineTab project={localProject} />
        )}
        {detailTab === 'activity' && (
          <ActivityTab project={localProject} onUpdate={setLocalProject} onSave={handleSave} />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TAB COMPONENTS
// ============================================================================

// Overview Tab
const OverviewTab: React.FC<{
  project: Project;
  onUpdate: (project: Project) => void;
  onSave: () => void;
}> = ({ project, onUpdate, onSave }) => {
  const [editing, setEditing] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark/30 rounded-lg p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{project.progress}%</span>
          </div>
          <p className="text-xs text-white/60">Progress</p>
        </div>
        
        <div className="bg-dark/30 rounded-lg p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{project.teamMembers?.length || 0}</span>
          </div>
          <p className="text-xs text-white/60">Team Members</p>
        </div>
        
        <div className="bg-dark/30 rounded-lg p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-2xl font-bold text-white">
              {project.phases?.reduce((sum, p) => sum + p.requirements.filter(r => r.completed).length, 0) || 0}
            </span>
          </div>
          <p className="text-xs text-white/60">Completed Tasks</p>
        </div>
        
        <div className="bg-dark/30 rounded-lg p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-2xl font-bold text-white">
              {(project.risks?.filter(r => r.status !== 'resolved').length || 0) + 
               (project.issues?.filter(i => i.status !== 'closed').length || 0)}
            </span>
          </div>
          <p className="text-xs text-white/60">Open Issues</p>
        </div>
      </div>

      {/* Project Details */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Project Details</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => editing ? onSave() : setEditing(true)}
            className="text-xs"
          >
            {editing ? <Save className="w-3 h-3 mr-1" /> : <Edit2 className="w-3 h-3 mr-1" />}
            {editing ? 'Save' : 'Edit'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Client</label>
            {editing ? (
              <Input
                value={project.client || ''}
                onChange={(e) => onUpdate({ ...project, client: e.target.value })}
                className="bg-dark/50 border-white/10 text-white text-sm"
              />
            ) : (
              <p className="text-sm text-white">{project.client || 'Not specified'}</p>
            )}
          </div>
          
          <div>
            <label className="text-xs text-white/60 mb-1 block">Project Manager</label>
            {editing ? (
              <Input
                value={project.projectManager || ''}
                onChange={(e) => onUpdate({ ...project, projectManager: e.target.value })}
                className="bg-dark/50 border-white/10 text-white text-sm"
              />
            ) : (
              <p className="text-sm text-white">{project.projectManager || 'Not assigned'}</p>
            )}
          </div>
          
          <div>
            <label className="text-xs text-white/60 mb-1 block">Category</label>
            {editing ? (
              <Input
                value={project.category || ''}
                onChange={(e) => onUpdate({ ...project, category: e.target.value })}
                className="bg-dark/50 border-white/10 text-white text-sm"
              />
            ) : (
              <p className="text-sm text-white">{project.category || 'Uncategorized'}</p>
            )}
          </div>
          
          <div>
            <label className="text-xs text-white/60 mb-1 block">Status</label>
            <p className="text-sm text-white capitalize">{project.status.replace('-', ' ')}</p>
          </div>
          
          <div>
            <label className="text-xs text-white/60 mb-1 block">Start Date</label>
            <p className="text-sm text-white">{project.startDate || 'Not set'}</p>
          </div>
          
          <div>
            <label className="text-xs text-white/60 mb-1 block">Due Date</label>
            <p className="text-sm text-white">{project.dueDate || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Project Objectives</h3>
        <div className="space-y-2">
          {project.objectives && project.objectives.length > 0 ? (
            project.objectives.map((obj, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-white/80">
                <Target className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                <span>{obj}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/40">No objectives defined yet</p>
          )}
        </div>
      </div>

      {/* Success Criteria */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Success Criteria</h3>
        <div className="space-y-2">
          {project.successCriteria && project.successCriteria.length > 0 ? (
            project.successCriteria.map((criteria, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-white/80">
                <Award className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                <span>{criteria}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/40">No success criteria defined yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Tasks Tab - Reuse existing phase/requirement logic
const TasksTab: React.FC<{
  project: Project;
  onUpdate: (project: Project) => void;
  onSave: () => void;
}> = ({ project, onUpdate, onSave }) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());

  const togglePhaseExpansion = (phaseId: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Project Phases & Tasks</h3>
        <Button size="sm" className="bg-green-500/20 text-green-400">
          <Plus className="w-4 h-4 mr-1" />
          Add Phase
        </Button>
      </div>

      {project.phases && project.phases.length > 0 ? (
        <div className="space-y-3">
          {project.phases.map(phase => {
            const isExpanded = expandedPhases.has(phase.id);
            const completedReqs = phase.requirements.filter(r => r.completed).length;
            const totalReqs = phase.requirements.length;
            const phaseProgress = totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0;

            return (
              <div key={phase.id} className="bg-dark/30 rounded-lg border border-white/5 overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => togglePhaseExpansion(phase.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                    )}
                    <h4 className="font-semibold text-white flex-1">{phase.name}</h4>
                    <Badge className={cn(
                      'text-xs',
                      phase.status === 'completed' && 'bg-green-500/20 text-green-400',
                      phase.status === 'in-progress' && 'bg-blue-500/20 text-blue-400',
                      phase.status === 'not-started' && 'bg-gray-500/20 text-gray-400'
                    )}>
                      {phase.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  {phase.description && (
                    <p className="text-sm text-white/60 ml-8 mb-3">{phase.description}</p>
                  )}
                  
                  <div className="flex items-center gap-3 ml-8">
                    <div className="flex-1 bg-dark/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{completedReqs}/{totalReqs} tasks</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/5">
                    {phase.requirements.map(req => (
                      <div key={req.id} className="flex items-start gap-3 p-3 bg-dark/20 rounded-lg hover:bg-dark/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={req.completed}
                          onChange={() => {
                            const updatedPhases = project.phases.map(p =>
                              p.id === phase.id
                                ? {
                                    ...p,
                                    requirements: p.requirements.map(r =>
                                      r.id === req.id ? { ...r, completed: !r.completed } : r
                                    )
                                  }
                                : p
                            );
                            onUpdate({ ...project, phases: updatedPhases });
                            onSave();
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              'text-sm text-white',
                              req.completed && 'line-through text-white/40'
                            )}>
                              {req.title}
                            </span>
                            {req.priority && req.priority !== 'medium' && (
                              <Badge className={cn(
                                'text-xs px-2 py-0',
                                req.priority === 'critical' && 'bg-red-500/20 text-red-400',
                                req.priority === 'high' && 'bg-orange-500/20 text-orange-400',
                                req.priority === 'low' && 'bg-gray-500/20 text-gray-400'
                              )}>
                                {req.priority}
                              </Badge>
                            )}
                          </div>
                          {req.description && (
                            <p className="text-xs text-white/40 mb-2">{req.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-white/50">
                            {req.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {req.assignedTo}
                              </div>
                            )}
                            {req.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {req.dueDate}
                              </div>
                            )}
                            {req.estimatedHours && (
                              <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {req.estimatedHours}h est.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-white/40">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No phases created yet</p>
        </div>
      )}
    </div>
  );
};

// Team Tab
const TeamTab: React.FC<{
  project: Project;
  onUpdate: (project: Project) => void;
  onSave: () => void;
}> = ({ project, onUpdate, onSave }) => {
  const [adding, setAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });

  const handleAdd = () => {
    if (newMember.name && newMember.role) {
      const updatedMembers = [...(project.teamMembers || []), { ...newMember, id: Date.now(), workload: 0 }];
      onUpdate({ ...project, teamMembers: updatedMembers });
      onSave();
      setNewMember({ name: '', role: '', email: '' });
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Team Members</h3>
        <Button size="sm" onClick={() => setAdding(true)} className="bg-blue-500/20 text-blue-400">
          <Plus className="w-4 h-4 mr-1" />
          Add Member
        </Button>
      </div>

      {adding && (
        <div className="bg-dark/30 rounded-lg p-4 border border-white/10 space-y-3">
          <Input
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            className="bg-dark/50 border-white/10 text-white"
          />
          <Input
            placeholder="Role"
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            className="bg-dark/50 border-white/10 text-white"
          />
          <Input
            placeholder="Email (optional)"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            className="bg-dark/50 border-white/10 text-white"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="flex-1 bg-green-500/20 text-green-400">
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.teamMembers && project.teamMembers.length > 0 ? (
          project.teamMembers.map(member => (
            <div key={member.id} className="bg-dark/30 rounded-lg p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{member.name}</h4>
                  <p className="text-sm text-white/60">{member.role}</p>
                  {member.email && (
                    <p className="text-xs text-white/40 mt-1">{member.email}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-white/40">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No team members added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Budget Tab
const BudgetTab: React.FC<{
  project: Project;
  onUpdate: (project: Project) => void;
  onSave: () => void;
}> = ({ project, onUpdate, onSave }) => {
  const budgetUsed = project.actualCost && project.budget ? (project.actualCost / project.budget) * 100 : 0;
  const timeUsed = project.actualHours && project.estimatedHours ? (project.actualHours / project.estimatedHours) * 100 : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Budget & Time Tracking</h3>

      {/* Budget Section */}
      <div className="bg-dark/30 rounded-lg p-5 border border-white/5">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Budget
        </h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-white/60 mb-2 block">Total Budget</label>
            <Input
              type="number"
              value={project.budget || ''}
              onChange={(e) => onUpdate({ ...project, budget: parseFloat(e.target.value) || undefined })}
              onBlur={onSave}
              placeholder="0.00"
              className="bg-dark/50 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-2 block">Actual Cost</label>
            <Input
              type="number"
              value={project.actualCost || ''}
              onChange={(e) => onUpdate({ ...project, actualCost: parseFloat(e.target.value) || undefined })}
              onBlur={onSave}
              placeholder="0.00"
              className="bg-dark/50 border-white/10 text-white"
            />
          </div>
        </div>
        {project.budget && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Budget Used</span>
              <span className={cn(
                'text-sm font-semibold',
                budgetUsed > 90 ? 'text-red-400' : budgetUsed > 75 ? 'text-yellow-400' : 'text-green-400'
              )}>
                {budgetUsed.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-dark/50 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-gradient-to-r from-green-500 to-blue-500'
                )}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Time Section */}
      <div className="bg-dark/30 rounded-lg p-5 border border-white/5">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-400" />
          Time Tracking
        </h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-white/60 mb-2 block">Estimated Hours</label>
            <Input
              type="number"
              value={project.estimatedHours || ''}
              onChange={(e) => onUpdate({ ...project, estimatedHours: parseFloat(e.target.value) || undefined })}
              onBlur={onSave}
              placeholder="0"
              className="bg-dark/50 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-2 block">Actual Hours</label>
            <Input
              type="number"
              value={project.actualHours || ''}
              onChange={(e) => onUpdate({ ...project, actualHours: parseFloat(e.target.value) || undefined })}
              onBlur={onSave}
              placeholder="0"
              className="bg-dark/50 border-white/10 text-white"
            />
          </div>
        </div>
        {project.estimatedHours && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Time Used</span>
              <span className={cn(
                'text-sm font-semibold',
                timeUsed > 90 ? 'text-red-400' : timeUsed > 75 ? 'text-yellow-400' : 'text-green-400'
              )}>
                {timeUsed.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-dark/50 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  timeUsed > 90 ? 'bg-red-500' : timeUsed > 75 ? 'bg-yellow-500' : 'bg-gradient-to-r from-green-500 to-blue-500'
                )}
                style={{ width: `${Math.min(timeUsed, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Risks Tab
const RisksTab: React.FC<{
  project: Project;
  onUpdate: (project: Project) => void;
  onSave: () => void;
}> = ({ project, onUpdate, onSave }) => {
  const [addingRisk, setAddingRisk] = useState(false);
  const [addingIssue, setAddingIssue] = useState(false);

  return (
    <div className="space-y-6">
      {/* Risks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Risks
          </h3>
          <Button size="sm" onClick={() => setAddingRisk(true)} className="bg-orange-500/20 text-orange-400">
            <Plus className="w-4 h-4 mr-1" />
            Add Risk
          </Button>
        </div>
        
        <div className="space-y-3">
          {project.risks && project.risks.length > 0 ? (
            project.risks.map(risk => (
              <div key={risk.id} className="bg-dark/30 rounded-lg p-4 border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{risk.title}</h4>
                  <Badge className={cn(
                    'text-xs',
                    risk.severity === 'critical' && 'bg-red-500/20 text-red-400',
                    risk.severity === 'high' && 'bg-orange-500/20 text-orange-400',
                    risk.severity === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                    risk.severity === 'low' && 'bg-gray-500/20 text-gray-400'
                  )}>
                    {risk.severity}
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mb-2">{risk.description}</p>
                <p className="text-sm text-white/80 mb-2">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>Likelihood: {risk.likelihood}</span>
                  <span>•</span>
                  <span>Status: {risk.status}</span>
                  {risk.owner && (
                    <>
                      <span>•</span>
                      <span>Owner: {risk.owner}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/40">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No risks identified yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Issues Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Issues
          </h3>
          <Button size="sm" onClick={() => setAddingIssue(true)} className="bg-red-500/20 text-red-400">
            <Plus className="w-4 h-4 mr-1" />
            Add Issue
          </Button>
        </div>
        
        <div className="space-y-3">
          {project.issues && project.issues.length > 0 ? (
            project.issues.map(issue => (
              <div key={issue.id} className="bg-dark/30 rounded-lg p-4 border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{issue.title}</h4>
                  <Badge className={cn(
                    'text-xs',
                    issue.status === 'open' && 'bg-red-500/20 text-red-400',
                    issue.status === 'in-progress' && 'bg-blue-500/20 text-blue-400',
                    issue.status === 'resolved' && 'bg-green-500/20 text-green-400',
                    issue.status === 'closed' && 'bg-gray-500/20 text-gray-400'
                  )}>
                    {issue.status}
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mb-2">{issue.description}</p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>Priority: {issue.priority}</span>
                  {issue.assignedTo && (
                    <>
                      <span>•</span>
                      <span>Assigned: {issue.assignedTo}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Created: {issue.createdAt}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/40">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No issues reported yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline Tab
const TimelineTab: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Project Timeline</h3>
      
      <div className="relative">
        {/* Timeline visualization */}
        <div className="space-y-4">
          {project.phases && project.phases.length > 0 ? (
            project.phases.map((phase, idx) => (
              <div key={phase.id} className="relative pl-8 pb-8 border-l-2 border-white/10 last:border-0">
                <div className="absolute left-0 top-0 w-4 h-4 -ml-[9px] rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
                <div className="bg-dark/30 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{phase.name}</h4>
                    <Badge className={cn(
                      'text-xs',
                      phase.status === 'completed' && 'bg-green-500/20 text-green-400',
                      phase.status === 'in-progress' && 'bg-blue-500/20 text-blue-400',
                      phase.status === 'not-started' && 'bg-gray-500/20 text-gray-400'
                    )}>
                      {phase.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  {phase.description && (
                    <p className="text-sm text-white/60 mb-3">{phase.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    {phase.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Start: {phase.startDate}
                      </div>
                    )}
                    {phase.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        End: {phase.endDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-white/40">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No timeline data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Activity Tab
const ActivityTab: React.FC<{
  project: Project;
  onUpdate: (project: Project) => void;
  onSave: () => void;
}> = ({ project, onUpdate, onSave }) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = [
        ...(project.comments || []),
        {
          id: Date.now(),
          author: 'Current User',
          content: newComment,
          timestamp: new Date().toLocaleString()
        }
      ];
      onUpdate({ ...project, comments: updatedComments });
      onSave();
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Comments & Discussion</h3>
        
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-dark/50 text-white placeholder:text-white/30 border border-white/10 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none text-sm"
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="mt-2 bg-green-500/20 text-green-400"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Add Comment
          </Button>
        </div>

        <div className="space-y-3">
          {project.comments && project.comments.length > 0 ? (
            project.comments.map(comment => (
              <div key={comment.id} className="bg-dark/30 rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm">{comment.author}</span>
                  <span className="text-xs text-white/40">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-white/80">{comment.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/40">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No comments yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Activity Log</h3>
        <div className="space-y-2">
          {project.activityLog && project.activityLog.length > 0 ? (
            project.activityLog.slice().reverse().map(activity => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <Activity className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/80">
                    <strong>{activity.user}</strong> {activity.action}
                  </p>
                  {activity.details && (
                    <p className="text-white/40 text-xs">{activity.details}</p>
                  )}
                  <span className="text-xs text-white/40">{activity.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/40">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No activity recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

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

