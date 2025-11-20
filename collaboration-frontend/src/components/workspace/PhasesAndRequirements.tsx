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
import { projectService } from '@/services/projectService';
import { Project, Phase, Requirement } from '@/types/project';

// ============================================================================
// ADD REQUIREMENT FORM COMPONENT
// ============================================================================
interface AddRequirementFormProps {
  projectId: number | string;
  phaseId: number;
  onAdd: (projectId: number | string, phaseId: number, requirement: Partial<Requirement>) => void;
}

const AddRequirementForm: React.FC<AddRequirementFormProps> = ({ projectId, phaseId, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(projectId, phaseId, { title, description, priority, dueDate, assignedTo });
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-2 bg-dark/30 rounded-md border border-white/5 space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New requirement title..."
        className="text-xs bg-dark/50 border-white/10"
      />
      <div className="flex gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="text-xs flex-1 bg-dark/50 border-white/10 rounded-md px-2 py-1 focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="text-xs flex-1 bg-dark/50 border-white/10"
        />
        <Input
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assignee"
          className="text-xs flex-1 bg-dark/50 border-white/10"
        />
      </div>
      <Button type="submit" size="sm" className="text-xs w-full">Add Requirement</Button>
    </form>
  );
};

// ============================================================================
// ADD PHASE FORM COMPONENT
// ============================================================================
interface AddPhaseFormProps {
  projectId: number | string;
  onAdd: (projectId: number | string, phaseName: string, phaseDescription: string) => void;
}

const AddPhaseForm: React.FC<AddPhaseFormProps> = ({ projectId, onAdd }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(projectId, name, description);
    setName('');
    setDescription('');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="text-xs border-dashed">
        <Plus className="w-3 h-3 mr-1" />
        Add Phase
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 bg-dark/50 rounded-lg border border-white/10 space-y-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New phase name..."
        className="text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Phase description (optional)"
        className="w-full bg-dark/70 text-white placeholder:text-white/30 border border-white/10 rounded-lg p-2 text-sm min-h-[60px] resize-none"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">Save Phase</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
      </div>
    </form>
  );
};


// ============================================================================
// MAIN COMPONENT: PhasesAndRequirements
// ============================================================================

interface PhasesAndRequirementsProps {
    project: Project;
    onProjectUpdate: (updatedProject: Project) => void;
}

export const PhasesAndRequirements: React.FC<PhasesAndRequirementsProps> = ({ project: initialProject, onProjectUpdate }) => {
    const [project, setProject] = useState(initialProject);
    const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());

    useEffect(() => {
        setProject(initialProject);
    }, [initialProject]);

    const updateProjectInDB = useCallback(async (projectId: string, updateData: any) => {
        try {
            const response = await projectService.updateProject(projectId, updateData);
            if (response.success) {
                const updatedProject = { ...project, ...updateData };
                setProject(updatedProject);
                onProjectUpdate(updatedProject); // Notify parent
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating project:', error);
            return false;
        }
    }, [project, onProjectUpdate]);

    const handleAddPhase = useCallback(async (projectId: string, name: string, description?: string) => {
        if (!name.trim()) return;

        const newPhase: Phase = {
            id: Date.now(),
            name,
            description: description || '',
            requirements: [],
            status: 'not-started',
            order: project.phases.length,
        };

        const updatedPhases = [...project.phases, newPhase];
        await updateProjectInDB(projectId, { phases: updatedPhases });

    }, [project, updateProjectInDB]);

    const handleDeletePhase = useCallback(async (projectId: string, phaseId: number) => {
        const updatedPhases = project.phases
            .filter(p => p.id !== phaseId)
            .map((p, index) => ({ ...p, order: index }));

        await updateProjectInDB(projectId, { phases: updatedPhases });
    }, [project, updateProjectInDB]);

    const handleUpdatePhaseStatus = useCallback(async (projectId: string, phaseId: number, status: Phase['status']) => {
        const updatedPhases = project.phases.map(p =>
            p.id === phaseId ? { ...p, status } : p
        );
        await updateProjectInDB(projectId, { phases: updatedPhases });
    }, [project, updateProjectInDB]);

    const handleAddRequirement = useCallback(async (projectId: string, phaseId: number, requirement: Partial<Requirement>) => {
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

        const updatedPhases = project.phases.map(phase => {
            if (phase.id === phaseId) {
                return {
                    ...phase,
                    requirements: [...phase.requirements, newRequirement]
                };
            }
            return phase;
        });

        await updateProjectInDB(projectId, { phases: updatedPhases });
    }, [project, updateProjectInDB]);

    const handleToggleRequirement = useCallback(async (projectId: string, phaseId: number, requirementId: number) => {
        let updatedPhases;
        const totalRequirements = project.phases.reduce((sum, p) => sum + p.requirements.length, 0);

        updatedPhases = project.phases.map(phase => {
            if (phase.id === phaseId) {
                const requirements = phase.requirements.map(req =>
                    req.id === requirementId ? { ...req, completed: !req.completed } : req
                );

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
        
        const completedRequirements = updatedPhases.reduce((sum, p) =>
            sum + p.requirements.filter(r => r.completed).length, 0
        );
        const progress = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
        
        await updateProjectInDB(projectId, { phases: updatedPhases, progress });
    }, [project, updateProjectInDB]);

    const handleDeleteRequirement = useCallback(async (projectId: string, phaseId: number, requirementId: number) => {
        const updatedPhases = project.phases.map(phase => {
            if (phase.id === phaseId) {
                return {
                    ...phase,
                    requirements: phase.requirements.filter(r => r.id !== requirementId)
                };
            }
            return phase;
        });
        await updateProjectInDB(projectId, { phases: updatedPhases });
    }, [project, updateProjectInDB]);

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

    if (!project) {
        return <div className="text-center py-12 text-white/60">Select a project to see its tasks.</div>;
    }

    return (
        <div className="space-y-4">
             <h3 className="text-2xl font-bold text-white">Tasks for: {project.name}</h3>
            {(project.phases || []).map((phase) => {
                const isExpanded = expandedPhases.has(phase.id);
                const completedReqs = phase.requirements.filter(r => r.completed).length;
                const totalReqs = phase.requirements.length;
                const phaseProgress = totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0;

                return (
                    <div key={phase.id} className="bg-dark/30 rounded-lg border border-white/5 overflow-hidden">
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
                                                handleToggleRequirement(project._id, phase.id, req.id);
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
                                                        handleDeleteRequirement(project._id, phase.id, req.id);
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

                                <AddRequirementForm
                                    projectId={project._id}
                                    phaseId={phase.id}
                                    onAdd={handleAddRequirement}
                                />

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (phase.status !== 'in-progress') {
                                                handleUpdatePhaseStatus(project._id, phase.id, 'in-progress');
                                            }
                                        }}
                                        className="text-[10px] px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded border border-blue-500/20 transition-colors"
                                    >
                                        Start Phase
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhase(project._id, phase.id);
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
            <div className="mt-4">
                <AddPhaseForm
                    projectId={project._id}
                    onAdd={handleAddPhase}
                />
            </div>
        </div>
    );
};
