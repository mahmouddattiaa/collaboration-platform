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
import { useCollaboration } from '@/contexts/CollaborationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { projectService } from '@/services/projectService';

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

// ... (keep existing interfaces)

interface ProjectManagerProps {
  roomId: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ roomId }) => {
  const { socket } = useCollaboration();
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [starredProjects, setStarredProjects] = useState<Set<number>>(new Set());

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [detailViewTab, setDetailViewTab] = useState<'overview' | 'tasks' | 'team' | 'budget' | 'risks' | 'timeline' | 'activity' | 'structure'>('overview');

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

  // Real-time Project Updates
  useEffect(() => {
    if (!socket) return;

    const onProjectCreated = (newProject: any) => {
      // Check if project belongs to this room (backend handles broadcast scoping, but safe to check)
      if (newProject.roomId === roomId) {
        const formattedProject = {
            ...newProject,
            id: newProject._id,
            teamMembers: newProject.team || [],
            createdAt: new Date(newProject.createdAt).toLocaleString(),
            starred: false,
            estimatedHours: 0,
            actualHours: 0,
            phases: newProject.phases || []
        };
        setProjects(prev => {
            // Prevent duplicates by checking both _id and id
            if (prev.some(p => p.id === formattedProject.id || p._id === formattedProject.id)) return prev;
            return [formattedProject, ...prev];
        });
      }
    };

    const onProjectUpdated = (updatedProject: any) => {
      if (updatedProject.roomId === roomId) {
        const formattedProject = {
            ...updatedProject,
            id: updatedProject._id,
            teamMembers: updatedProject.team || [],
            createdAt: new Date(updatedProject.createdAt).toLocaleString(),
            // Preserve local starred state if possible, or rely on separate logic
            starred: projects.find(p => p.id === updatedProject._id)?.starred || false,
            phases: updatedProject.phases || []
        };
        
        setProjects(prev => prev.map(p => 
            p.id === formattedProject.id ? { ...p, ...formattedProject } : p
        ));
      }
    };

    const onProjectDeleted = (data: { projectId: string }) => {
        setProjects(prev => prev.filter(p => p.id !== data.projectId && p._id !== data.projectId));
    };

    socket.on('project-created', onProjectCreated);
    socket.on('project-updated', onProjectUpdated);
    socket.on('project-deleted', onProjectDeleted);

    return () => {
      socket.off('project-created', onProjectCreated);
      socket.off('project-updated', onProjectUpdated);
      socket.off('project-deleted', onProjectDeleted);
    };
  }, [socket, roomId, projects]); // Added projects to dependency to access starred state safely? No, that causes re-subscription. Better to use functional update.

  // Load projects from MongoDB via API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectService.getProjects(roomId);
        if (response.success) {
          const loadedProjects = response.data.map((project: any) => ({
            ...project,
            id: project._id, // Map MongoDB _id to id for local use
            _id: project._id, // Keep MongoDB _id for updates
            phases: project.phases || []
          }));
          setProjects(loadedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    if (roomId) {
      loadProjects();
    }
  }, [roomId]);

  // Helper function to update project via API
  const updateProjectInDB = useCallback(async (projectId: number | string, updateData: any) => {
    try {
      const response = await projectService.updateProject(projectId.toString(), updateData);
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  }, []);

  // Note: Projects are now saved to MongoDB via API calls, not localStorage
  // Starred projects are still stored locally (user preference)
  useEffect(() => {
    const savedStarred = localStorage.getItem(`projects-starred-${roomId}`);
    if (savedStarred) {
      setStarredProjects(new Set(JSON.parse(savedStarred)));
    }
  }, [roomId]);

  // Save starred projects to localStorage (user preference)
  useEffect(() => {
    if (starredProjects.size > 0) {
      localStorage.setItem(`projects-starred-${roomId}`, JSON.stringify([...starredProjects]));
    } else {
      localStorage.removeItem(`projects-starred-${roomId}`);
    }
  }, [starredProjects, roomId]);

  // Create or update project
  const handleSaveProject = useCallback(async () => {
    if (!newProjectName.trim()) return;

    const tagsArray = newProjectTags.split(',').map(t => t.trim()).filter(t => t);
    const currentUser = 'Current User'; // Get from auth context

    try {
      if (editingProjectId !== null) {
        // Update existing project via API
        const updateData = {
          name: newProjectName,
          description: newProjectDescription,
          priority: newProjectPriority,
          startDate: newProjectStartDate,
          dueDate: newProjectDueDate,
          tags: tagsArray,
          budget: newProjectBudget ? parseFloat(newProjectBudget) : undefined,
          client: newProjectClient || undefined,
          projectManager: newProjectManager || undefined,
          category: newProjectCategory || undefined,
        };

        const response = await projectService.updateProject(editingProjectId, updateData);
        
        if (response.success) {
          setProjects(prev => prev.map(project =>
            project.id === editingProjectId
              ? { ...response.data, id: response.data._id }
              : project
          ));
        }
        setEditingProjectId(null);
      } else {
        // Create new project via API
        const newProjectData = {
          roomId,
          name: newProjectName,
          description: newProjectDescription,
          status: 'planning',
          priority: newProjectPriority,
          progress: 0,
          startDate: newProjectStartDate || new Date().toISOString().split('T')[0],
          dueDate: newProjectDueDate,
          tags: tagsArray,
          budget: newProjectBudget ? parseFloat(newProjectBudget) : undefined,
          actualCost: 0,
          client: newProjectClient || undefined,
          projectManager: newProjectManager || undefined,
          category: newProjectCategory || undefined,
          phases: [],
          milestones: [],
          team: [],
          risks: [],
          issues: [],
          comments: [],
          attachments: [],
        };

        const response = await projectService.createProject(newProjectData);
        
        if (response.success) {
          const createdProject = {
            ...response.data,
            id: response.data._id,
            teamMembers: response.data.team || [],
            createdAt: new Date(response.data.createdAt).toLocaleString(),
            starred: false,
            estimatedHours: 0,
            actualHours: 0,
          };
          setProjects(prev => [...prev, createdProject]);
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
      return;
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
  }, [newProjectName, newProjectDescription, newProjectPriority, newProjectStartDate, newProjectDueDate, newProjectTags, newProjectBudget, newProjectClient, newProjectManager, newProjectCategory, editingProjectId, roomId]);

  // Delete project
  const handleDeleteProject = useCallback(async (projectId: number) => {
    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setStarredProjects(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
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
  const handleUpdateStatus = useCallback(async (projectId: number, newStatus: Project['status']) => {
    try {
      const response = await projectService.updateProject(projectId, { status: newStatus });
      if (response.success) {
        setProjects(prev => prev.map(project =>
          project.id === projectId ? { ...project, status: newStatus } : project
        ));
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }, []);

  // Update project progress
  const handleUpdateProgress = useCallback(async (projectId: number, newProgress: number) => {
    const clampedProgress = Math.min(100, Math.max(0, newProgress));
    try {
      const response = await projectService.updateProject(projectId, { progress: clampedProgress });
      if (response.success) {
        setProjects(prev => prev.map(project =>
          project.id === projectId ? { ...project, progress: clampedProgress } : project
        ));
      }
    } catch (error) {
      console.error('Error updating project progress:', error);
    }
  }, []);

  // Add milestone
  const handleAddMilestone = useCallback(async (projectId: number, milestoneTitle: string, dueDate: string) => {
    if (!milestoneTitle.trim()) return;

    const newMilestone: Milestone = {
      id: Date.now(),
      title: milestoneTitle,
      completed: false,
      dueDate: dueDate
    };

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedMilestones = [...project.milestones, newMilestone];
    const success = await updateProjectInDB(projectId, { milestones: updatedMilestones });
    
    if (success) {
      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? { ...p, milestones: updatedMilestones }
          : p
      ));
    }
  }, [projects, updateProjectInDB]);

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

  // Add new phase to project (Enhanced to support all new fields)
  const handleAddPhase = useCallback(async (projectId: number, phaseData: Partial<Phase> | string, phaseDescription?: string) => {
    // Support both old signature (name, description) and new signature (phaseData object)
    const isOldSignature = typeof phaseData === 'string';
    const name = isOldSignature ? phaseData : (phaseData as Partial<Phase>).name || '';
    const description = isOldSignature ? phaseDescription : (phaseData as Partial<Phase>).description;
    
    if (!name.trim()) return;

    const newPhase: Phase = isOldSignature ? {
      id: Date.now(),
      name,
      description: description || '',
      requirements: [],
      status: 'not-started',
      order: 0
    } : {
      id: Date.now(),
      name,
      description: description || '',
      requirements: [],
      status: 'not-started',
      order: 0,
      ...(phaseData as Partial<Phase>),
    };

    // Find the project and get MongoDB ID
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const mongoId = project._id || projectId;
    const updatedPhases = [...project.phases, { ...newPhase, order: project.phases.length }];

    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, phases: updatedPhases } : p
    ));

    // Save to MongoDB
    try {
      await updateProjectInDB(mongoId, { phases: updatedPhases });
    } catch (error) {
      console.error('Error saving phase:', error);
    }
  }, [projects, updateProjectInDB]);

  // Delete phase
  const handleDeletePhase = useCallback(async (projectId: number, phaseId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const mongoId = project._id || projectId;
    const updatedPhases = project.phases
      .filter(p => p.id !== phaseId)
      .map((p, index) => ({ ...p, order: index }));

    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, phases: updatedPhases } : p
    ));

    // Save to MongoDB
    await updateProjectInDB(mongoId, { phases: updatedPhases });
  }, [projects, updateProjectInDB]);

  // Update phase status
  const handleUpdatePhaseStatus = useCallback(async (projectId: number, phaseId: number, status: Phase['status']) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const mongoId = project._id || projectId;
    const updatedPhases = project.phases.map(p =>
      p.id === phaseId ? { ...p, status } : p
    );

    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, phases: updatedPhases } : p
    ));

    // Save to MongoDB
    await updateProjectInDB(mongoId, { phases: updatedPhases });
  }, [projects, updateProjectInDB]);

  // Add requirement to phase
  const handleAddRequirement = useCallback(async (projectId: number, phaseId: number, requirement: Partial<Requirement>) => {
    if (!requirement.title?.trim()) return;

    const newRequirement: Requirement = {
      id: Date.now(),
      title: requirement.title,
      description: requirement.description || '',
      completed: false,
      priority: requirement.priority || 'medium',
      status: 'todo',
      assignedTo: requirement.assignedTo,
      dueDate: requirement.dueDate
    };

    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const mongoId = project._id || projectId;
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          requirements: [...phase.requirements, newRequirement]
        };
      }
      return phase;
    });

    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, phases: updatedPhases } : p
    ));

    // Save to MongoDB
    await updateProjectInDB(mongoId, { phases: updatedPhases });
  }, [projects, updateProjectInDB]);

  // Toggle requirement completion
  const handleToggleRequirement = useCallback(async (projectId: number, phaseId: number, requirementId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const mongoId = project._id || projectId;
    const updatedPhases = project.phases.map(phase => {
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
    const totalRequirements = updatedPhases.reduce((sum, p) => sum + p.requirements.length, 0);
    const completedRequirements = updatedPhases.reduce((sum, p) =>
      sum + p.requirements.filter(r => r.completed).length, 0
    );
    const progress = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, phases: updatedPhases, progress } : p
    ));

    // Save to MongoDB
    await updateProjectInDB(mongoId, { phases: updatedPhases, progress });
  }, [projects, updateProjectInDB]);

  // Delete requirement
  const handleDeleteRequirement = useCallback(async (projectId: number, phaseId: number, requirementId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const mongoId = project._id || projectId;
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          requirements: phase.requirements.filter(r => r.id !== requirementId)
        };
      }
      return phase;
    });

    // Update local state
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, phases: updatedPhases } : p
    ));

    // Save to MongoDB
    await updateProjectInDB(mongoId, { phases: updatedPhases });
  }, [projects, updateProjectInDB]);

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
        onUpdate={async (updated) => {
          // Update local state
          setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
          
          // Save to MongoDB
          const mongoId = updated._id || updated.id;
          await updateProjectInDB(mongoId, {
            phases: updated.phases,
            progress: updated.progress,
            milestones: updated.milestones,
            teamMembers: updated.teamMembers,
            risks: updated.risks,
            issues: updated.issues,
            comments: updated.comments,
            attachments: updated.attachments,
          });
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
                key={project._id || project.id}
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
                                          req.priority === 'critical' && 'bg-red-500/20 text-red-400',
                                          req.priority === 'high' && 'bg-orange-500/20 text-orange-400',
                                          req.priority === 'low' && 'bg-gray-500/20 text-gray-400'
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

  const handleSave = (projectToSave?: Project) => {
    const projectData = projectToSave || localProject;
    onUpdate(projectData);
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
          { id: 'structure', label: 'Structure', icon: GitBranch },
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
        {detailTab === 'structure' && (
          <StructureTab project={localProject} />
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
  onSave: (project: Project) => void;
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

  const handleAddPhase = (projectId: number, phaseData: Partial<Phase>) => {
    const newPhase: Phase = {
      id: Date.now(),
      name: phaseData.name || '',
      description: phaseData.description || '',
      requirements: [],
      status: 'not-started',
      order: project.phases?.length || 0,
      ...phaseData,
    };
    
    const updatedPhases = [...(project.phases || []), newPhase];
    const updatedProject = { ...project, phases: updatedPhases };
    
    // Update local state
    onUpdate(updatedProject);
    // Save to database immediately
    onSave(updatedProject);
  };

  const handleAddRequirement = (phaseId: number, title: string, priority: 'low' | 'medium' | 'high' | 'critical') => {
    const newRequirement: Requirement = {
      id: Date.now(),
      title,
      description: '',
      completed: false,
      priority,
      status: 'todo'
    };

    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          requirements: [...phase.requirements, newRequirement]
        };
      }
      return phase;
    });

    onUpdate({ ...project, phases: updatedPhases });
    onSave();
  };

  const handleToggleRequirement = (phaseId: number, requirementId: number) => {
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        const requirements = phase.requirements.map(req =>
          req.id === requirementId ? { ...req, completed: !req.completed } : req
        );

        // Auto-update phase status
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
    const totalRequirements = updatedPhases.reduce((sum, p) => sum + p.requirements.length, 0);
    const completedRequirements = updatedPhases.reduce((sum, p) =>
      sum + p.requirements.filter(r => r.completed).length, 0
    );
    const progress = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

    onUpdate({ ...project, phases: updatedPhases, progress });
    onSave();
  };

  const handleDeletePhase = (phaseId: number) => {
    const updatedPhases = project.phases
      .filter(p => p.id !== phaseId)
      .map((p, index) => ({ ...p, order: index }));
    
    onUpdate({ ...project, phases: updatedPhases });
    onSave();
  };

  const handleDeleteRequirement = (phaseId: number, requirementId: number) => {
    const updatedPhases = project.phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          requirements: phase.requirements.filter(r => r.id !== requirementId)
        };
      }
      return phase;
    });

    onUpdate({ ...project, phases: updatedPhases });
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Project Phases & Tasks</h3>
      </div>

      {/* Add Phase Form */}
      <AddPhaseForm
        projectId={project.id}
        onAdd={handleAddPhase}
        existingPhases={project.phases || []}
      />

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
                    <div className="flex items-center justify-between mb-2 pt-3">
                      <span className="text-xs text-white/60">Tasks in this phase</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhase(phase.id);
                        }}
                        className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete Phase
                      </Button>
                    </div>

                    {phase.requirements.map(req => (
                      <div key={req.id} className="flex items-start gap-3 p-3 bg-dark/20 rounded-lg hover:bg-dark/30 transition-colors group">
                        <input
                          type="checkbox"
                          checked={req.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleRequirement(phase.id, req.id);
                          }}
                          className="mt-1 cursor-pointer"
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequirement(phase.id, req.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}

                    {/* Add Requirement Form */}
                    <AddRequirementForm
                      projectId={project.id}
                      phaseId={phase.id}
                      onAdd={handleAddRequirement}
                    />
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
            <Users className="w-12 h-12 mb-4 opacity-20" />
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
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className={cn(
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
              <div className={cn(
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

// Enhanced Structure Tab (Tree View with Branches & Dependencies)
function StructureTab({ project }: { project: Project }) {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  // Organize phases by hierarchy (parent-child relationships)
  const rootPhases = project.phases?.filter(p => !p.parentPhaseId) || [];
  const getSubPhases = (parentId: number) => 
    project.phases?.filter(p => p.parentPhaseId === parentId) || [];

  // Get phase dependencies
  const getPhaseDependencies = (phase: Phase) => {
    if (!phase.dependsOn || phase.dependsOn.length === 0) return [];
    return project.phases?.filter(p => phase.dependsOn?.includes(p.id)) || [];
  };

  // Render a phase node with all details
  const renderPhaseNode = (phase: Phase, level: number = 1, parentColor?: string) => {
    const subPhases = getSubPhases(phase.id);
    const dependencies = getPhaseDependencies(phase);
    const isSelected = selectedPhase === phase.id;
    const phaseColor = phase.color || parentColor || '#8b5cf6';
    
    const completedReqs = phase.requirements.filter(r => r.completed).length;
    const totalReqs = phase.requirements.length;
    const phaseProgress = totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0;

    // Status colors
    const statusColors = {
      'not-started': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'blocked': 'bg-red-500/20 text-red-400 border-red-500/30',
      'on-hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };

    const priorityIcons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    const typeIcons = {
      sequential: '⚡',
      parallel: '🔀',
      optional: '⭐',
      milestone: '🎯'
    };

    return (
      <div key={phase.id} className="relative">
        {/* Phase Node */}
        <div 
          className={`relative w-72 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 group cursor-pointer ${
            isSelected ? 'ring-2 ring-white/40 scale-105' : ''
          }`}
          style={{ 
            background: `linear-gradient(135deg, ${phaseColor}20, ${phaseColor}10)`,
            borderColor: `${phaseColor}40`,
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
          onClick={() => setSelectedPhase(isSelected ? null : phase.id)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              {phase.parentPhaseId && (
                <GitBranch className="w-3 h-3 text-white/40" />
              )}
              <Badge 
                variant="outline" 
                className={`text-[10px] px-2 py-0.5 ${statusColors[phase.status || 'not-started']}`}
              >
                {phase.status?.replace('-', ' ') || 'Not Started'}
              </Badge>
              {phase.priority && (
                <span className="text-xs">{priorityIcons[phase.priority]}</span>
              )}
              {phase.type && (
                <span className="text-xs">{typeIcons[phase.type]}</span>
              )}
            </div>
          </div>

          {/* Phase Name */}
          <h4 className="font-semibold text-white text-sm mb-2">{phase.name}</h4>
          
          {/* Description */}
          {phase.description && (
            <p className="text-xs text-white/60 mb-3 line-clamp-2">{phase.description}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {totalReqs > 0 && (
              <div className="bg-black/20 rounded px-2 py-1.5">
                <div className="text-[9px] text-white/40">Tasks</div>
                <div className="text-xs font-bold text-white">{completedReqs}/{totalReqs}</div>
              </div>
            )}
            {phase.estimatedHours && (
              <div className="bg-black/20 rounded px-2 py-1.5">
                <div className="text-[9px] text-white/40">Hours</div>
                <div className="text-xs font-bold text-blue-400">{phase.actualHours || 0}/{phase.estimatedHours}h</div>
              </div>
            )}
            {phase.budget && (
              <div className="bg-black/20 rounded px-2 py-1.5">
                <div className="text-[9px] text-white/40">Budget</div>
                <div className="text-xs font-bold text-green-400">${phase.actualCost || 0}/${phase.budget}</div>
              </div>
            )}
            {phase.owner && (
              <div className="bg-black/20 rounded px-2 py-1.5">
                <div className="text-[9px] text-white/40">Owner</div>
                <div className="text-xs font-bold text-purple-400 truncate">{phase.owner}</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {totalReqs > 0 && (
            <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${phaseProgress}%`,
                  background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}cc)`
                }}
              />
            </div>
          )}

          {/* Dependencies Indicator */}
          {dependencies.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-white/40">
              <Link2 className="w-3 h-3" />
              <span>Depends on {dependencies.length} phase(s)</span>
            </div>
          )}

          {/* Sub-phases Indicator */}
          {subPhases.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-white/40">
              <GitBranch className="w-3 h-3" />
              <span>{subPhases.length} branch(es)</span>
            </div>
          )}

          {/* Expanded Details */}
          {isSelected && showDetails && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
              {phase.startDate && (
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="w-3 h-3" />
                  <span>{phase.startDate} {phase.endDate && `→ ${phase.endDate}`}</span>
                </div>
              )}
              {phase.deliverables && phase.deliverables.length > 0 && (
                <div className="text-white/60">
                  <div className="font-semibold mb-1">Deliverables:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                    {phase.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {phase.team && phase.team.length > 0 && (
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="w-3 h-3" />
                  <span>{phase.team.join(', ')}</span>
                </div>
              )}
              {phase.notes && (
                <div className="text-white/60 text-[10px] italic">{phase.notes}</div>
              )}
            </div>
          )}
        </div>

        {/* Render Sub-Phases (Branches) */}
        {subPhases.length > 0 && (
          <div className="ml-12 mt-6 pl-6 border-l-2 border-white/10 space-y-4">
            {subPhases.map(subPhase => renderPhaseNode(subPhase, level + 1, phaseColor))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-auto p-8 min-h-[600px] bg-dark/30 rounded-xl">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          Project Structure
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-white/60 hover:text-white"
        >
          <Eye className={`w-4 h-4 mr-2 ${!showDetails ? 'opacity-50' : ''}`} />
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
      </div>

      <div className="flex flex-col items-center">
        {/* Root Node: Project */}
        <div className="relative z-10 mb-12">
          <div className="w-80 p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl backdrop-blur-md shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="bg-blue-500/20 border-blue-500/30 text-blue-300 text-xs">Project Root</Badge>
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${project.status === 'active' ? 'bg-green-500 text-green-500' : 'bg-yellow-500 text-yellow-500'}`} />
            </div>
            <h3 className="font-bold text-white text-2xl mb-3 tracking-tight">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-white/70 mb-4">{project.description}</p>
            )}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-white/40 mb-1">Progress</div>
                <div className="text-lg font-bold text-white">{project.progress}%</div>
              </div>
              <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-white/40 mb-1">Phases</div>
                <div className="text-lg font-bold text-blue-400">{rootPhases.length}</div>
              </div>
              <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-white/40 mb-1">Total Tasks</div>
                <div className="text-lg font-bold text-purple-400">
                  {project.phases?.reduce((sum, p) => sum + p.requirements.length, 0) || 0}
                </div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          {/* Vertical Line Down */}
          {rootPhases.length > 0 && (
            <div className="absolute top-full left-1/2 w-px h-12 bg-gradient-to-b from-blue-500/30 to-white/10 -translate-x-1/2" />
          )}
        </div>

        {/* Root Phases with Branches */}
        {rootPhases.length > 0 ? (
          <div className="space-y-8 w-full max-w-4xl">
            {rootPhases.map((phase) => (
              <div key={phase.id} className="flex justify-center">
                {renderPhaseNode(phase)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-white/40 border-2 border-dashed border-white/10 rounded-xl">
            <GitBranch className="w-12 h-12 mb-4 opacity-20" />
            <p className="italic">No phases defined yet.</p>
            <p className="text-sm mt-2">Add phases in the "Tasks & Phases" tab to visualize the project tree.</p>
          </div>
        )}

        {/* Legend */}
        {rootPhases.length > 0 && (
          <div className="mt-12 p-4 bg-black/20 rounded-xl border border-white/10 w-full max-w-4xl">
            <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="text-white/60">Sequential</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔀</span>
                <span className="text-white/60">Parallel</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="text-white/60">Optional</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span className="text-white/60">Milestone</span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="w-3 h-3 text-white/60" />
                <span className="text-white/60">Sub-phase</span>
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="w-3 h-3 text-white/60" />
                <span className="text-white/60">Dependencies</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🟢</span>
                <span className="text-white/60">Low Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔴</span>
                <span className="text-white/60">Critical</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Old Structure Tab preserved below for reference
function OldStructureTab({ project }: { project: Project }) {
  return (
    <div className="overflow-auto p-8 min-h-[600px] flex justify-center bg-dark/30 rounded-xl">
      <div className="flex flex-col items-center">
        {/* Root Node: Project */}
        <div className="relative z-10 mb-12">
          <div className="w-72 p-5 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl backdrop-blur-md shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="bg-blue-500/20 border-blue-500/30 text-blue-300">Project Root</Badge>
              <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${project.status === 'active' ? 'bg-green-500 text-green-500' : 'bg-yellow-500 text-yellow-500'}`} />
            </div>
            <h3 className="font-bold text-white text-xl mb-2 truncate tracking-tight">{project.name}</h3>
            <div className="flex items-center justify-between text-xs text-white/60 mb-3">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {project.progress}%</span>
              <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {project.phases?.length || 0} Phases</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          {/* Vertical Line Down */}
          {project.phases && project.phases.length > 0 && (
            <div className="absolute top-full left-1/2 w-px h-12 bg-gradient-to-b from-blue-500/30 to-white/10 -translate-x-1/2" />
          )}
        </div>

        {/* Level 1: Phases */}
        {project.phases && project.phases.length > 0 && (
          <div className="flex items-start gap-8 relative">
            {/* Horizontal Connector Bar */}
            {project.phases.length > 1 && (
              <div className="absolute -top-12 left-0 right-0 h-px bg-white/10 mx-[calc(100%/2/var(--count))]" />
            )}
            
            {project.phases.map((phase, index) => {
              const isFirst = index === 0;
              const isLast = index === project.phases.length - 1;
              const isOnly = project.phases.length === 1;

              return (
                <div key={phase.id} className="flex flex-col items-center relative">
                   {/* Connectors */}
                   {!isOnly && (
                     <>
                       {/* Vertical line up */}
                       <div className="absolute -top-12 left-1/2 w-px h-12 bg-white/10 -translate-x-1/2" />
                       {/* Horizontal line segments for first/last to create the T shape properly */}
                       <div className={`absolute -top-12 h-px bg-white/10 
                         ${isFirst ? 'left-1/2 w-[calc(50%+1rem)]' : ''} 
                         ${isLast ? 'right-1/2 w-[calc(50%+1rem)]' : ''}
                         ${!isFirst && !isLast ? 'w-[calc(100%+2rem)] left-[-1rem]' : ''}
                       `} />
                     </>
                   )}
                   {isOnly && (
                      <div className="absolute -top-12 left-1/2 w-px h-12 bg-white/10 -translate-x-1/2" />
                   )}
                   
                   {/* Phase Node */}
                   <div className="w-56 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm mb-8 hover:bg-purple-500/20 transition-all duration-300 group relative">
                     {/* Node connection point top */}
                     <div className="absolute -top-1 left-1/2 w-2 h-2 bg-purple-500/50 rounded-full -translate-x-1/2" />
                     
                     <div className="flex items-center justify-between mb-2">
                       <Badge variant="outline" className="text-[10px] h-5 bg-purple-500/20 border-purple-500/30 text-purple-300">Phase {index + 1}</Badge>
                       <span className={`text-[10px] uppercase font-bold ${phase.status === 'completed' ? 'text-green-400' : 'text-white/40'}`}>{phase.status}</span>
                     </div>
                     <div className="font-medium text-white text-sm mb-1">{phase.name}</div>
                     <div className="text-xs text-white/50 truncate mb-3">{phase.description || 'No description'}</div>
                     
                     {/* Phase Stats */}
                     <div className="flex gap-2">
                        <div className="flex-1 bg-black/20 rounded px-2 py-1 text-center">
                           <div className="text-[10px] text-white/40">Tasks</div>
                           <div className="text-xs font-bold text-white">{phase.requirements?.length || 0}</div>
                        </div>
                        <div className="flex-1 bg-black/20 rounded px-2 py-1 text-center">
                           <div className="text-[10px] text-white/40">Done</div>
                           <div className="text-xs font-bold text-green-400">{phase.requirements?.filter(r => r.completed).length || 0}</div>
                        </div>
                     </div>

                     {/* Node connection point bottom (if has children) */}
                     {phase.requirements && phase.requirements.length > 0 && (
                        <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-purple-500/50 rounded-full -translate-x-1/2" />
                     )}
                   </div>

                   {/* Level 2: Requirements/Milestones */}
                   {phase.requirements && phase.requirements.length > 0 && (
                     <div className="flex flex-col gap-3 relative pl-6 border-l-2 border-white/5 ml-6 pb-4">
                       {phase.requirements.map(req => (
                         <div key={req.id} className="relative group/req">
                           {/* Horizontal connector from vertical line */}
                           <div className="absolute top-3 -left-[1.6rem] w-4 h-0.5 bg-white/5 group-hover/req:bg-white/20 transition-colors" />
                           <div className="absolute top-[0.65rem] -left-[1.6rem] w-2 h-2 rounded-full bg-dark border border-white/10 z-10" />
                           
                           <div className={`p-3 rounded-lg border text-xs w-48 transition-all duration-200 hover:scale-105 cursor-default
                             ${req.completed 
                               ? 'bg-green-500/10 border-green-500/20 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                               : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}
                           `}>
                             <div className="flex items-start gap-2">
                               <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${req.priority === 'high' || req.priority === 'critical' ? 'bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.5)]' : 'bg-blue-400'}`} />
                               <div className="flex-1">
                                 <div className="font-medium mb-0.5">{req.title}</div>
                                 {req.assignedTo && <div className="text-[10px] opacity-50 flex items-center gap-1"><User className="w-2 h-2" /> {req.assignedTo}</div>}
                               </div>
                               {req.completed && <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />}
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
        )}
        
        {(!project.phases || project.phases.length === 0) && (
          <div className="flex flex-col items-center justify-center p-12 text-white/40 border-2 border-dashed border-white/10 rounded-xl">
            <GitBranch className="w-12 h-12 mb-4 opacity-20" />
            <p className="italic">No phases defined yet.</p>
            <p className="text-sm mt-2">Add phases in the "Tasks & Phases" tab to visualize the project tree.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Add Phase Form Component
function AddPhaseForm({ projectId, onAdd, existingPhases }: {
  projectId: number;
  onAdd: (projectId: number, phaseData: Partial<Phase>) => void;
  existingPhases?: Phase[];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Basic fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [type, setType] = useState<'sequential' | 'parallel' | 'optional' | 'milestone'>('sequential');
  
  // Advanced fields
  const [owner, setOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dependsOn, setDependsOn] = useState<number[]>([]);
  const [parentPhaseId, setParentPhaseId] = useState<number | undefined>(undefined);
  const [deliverables, setDeliverables] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const phaseData: Partial<Phase> = {
      name,
      description,
      priority,
      type,
      owner: owner || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
      parentPhaseId,
      deliverables: deliverables ? deliverables.split(',').map(d => d.trim()).filter(d => d) : undefined,
      color: color !== '#3b82f6' ? color : undefined,
    };
    
    onAdd(projectId, phaseData);
    
    // Reset form
    setName('');
    setDescription('');
    setPriority('medium');
    setType('sequential');
    setOwner('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setEstimatedHours('');
    setDependsOn([]);
    setParentPhaseId(undefined);
    setDeliverables('');
    setColor('#3b82f6');
    setIsAdding(false);
    setShowAdvanced(false);
  };

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAdding(true)}
        className="w-full border border-dashed border-white/10 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 h-10"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Phase
      </Button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-lg p-4 border border-white/10 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          New Phase
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-6 text-xs text-white/60 hover:text-white"
        >
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showAdvanced ? 'Less' : 'More'} Options
        </Button>
      </div>

      {/* Basic Fields */}
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Phase Name (e.g., Planning, Development)"
        className="bg-black/30 border-white/10 h-9 text-sm text-white"
        autoFocus
      />
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
        className="w-full bg-black/30 text-white placeholder:text-white/30 border border-white/10 rounded-lg p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-white/60 mb-1 block">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full bg-black/30 text-white border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="critical">🔴 Critical</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1 block">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full bg-black/30 text-white border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="sequential">⚡ Sequential</option>
            <option value="parallel">🔀 Parallel</option>
            <option value="optional">⭐ Optional</option>
            <option value="milestone">🎯 Milestone</option>
          </select>
        </div>
      </div>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black/30 border-white/10 h-8 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black/30 border-white/10 h-8 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Budget ($)</label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                className="bg-black/30 border-white/10 h-8 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Est. Hours</label>
              <Input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
                className="bg-black/30 border-white/10 h-8 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Owner/Responsible</label>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Name or email"
              className="bg-black/30 border-white/10 h-8 text-xs text-white"
            />
          </div>

          {existingPhases && existingPhases.length > 0 && (
            <>
              <div>
                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  Parent Phase (Create Sub-Phase/Branch)
                </label>
                <select
                  value={parentPhaseId || ''}
                  onChange={(e) => setParentPhaseId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-black/30 text-white border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">None (Root Phase)</option>
                  {existingPhases.map(phase => (
                    <option key={phase.id} value={phase.id}>└─ {phase.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Depends On (Select dependencies)
                </label>
                <div className="bg-black/30 border border-white/10 rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto">
                  {existingPhases.map(phase => (
                    <label key={phase.id} className="flex items-center gap-2 text-xs text-white/70 hover:text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dependsOn.includes(phase.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDependsOn([...dependsOn, phase.id]);
                          } else {
                            setDependsOn(dependsOn.filter(id => id !== phase.id));
                          }
                        }}
                        className="cursor-pointer"
                      />
                      {phase.name}
                    </label>
                  ))}
                  {existingPhases.length === 0 && (
                    <p className="text-xs text-white/40">No phases available</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-white/60 mb-1 block">Deliverables (comma separated)</label>
            <Input
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="e.g., Design document, Prototype, Code review"
              className="bg-black/30 border-white/10 h-8 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Color (for visualization)</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-8 bg-black/30 border border-white/10 rounded cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 bg-black/30 border-white/10 h-8 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsAdding(false);
            setShowAdvanced(false);
          }}
          className="h-8 text-xs hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="h-8 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Phase
        </Button>
      </div>
    </div>
  );
}

// Add Requirement Form Component
function AddRequirementForm({ projectId, phaseId, onAdd }: {
  projectId: number;
  phaseId: number;
  onAdd: (projectId: number, phaseId: number, title: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(projectId, phaseId, title, priority);
    setTitle('');
    setPriority('medium');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAdding(true)}
        className="w-full border border-dashed border-white/10 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 h-8 text-xs"
      >
        <Plus className="w-3 h-3 mr-2" />
        Add Task
      </Button>
    );
  }

  return (
    <div className="bg-black/20 rounded-lg p-2 border border-white/10 mt-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
        className="mb-2 bg-black/20 border-white/10 h-7 text-xs"
        autoFocus
      />
      <div className="flex gap-2 mb-2">
        {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`px-2 py-1 rounded text-[10px] capitalize border ${
              priority === p
                ? 'bg-white/10 border-white/20 text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsAdding(false)}
          className="h-6 text-[10px] hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="h-6 text-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

