import React, { useState, useMemo } from 'react';
import { 
  Plus, MoreVertical, Calendar, User, CheckCircle2, Circle, 
  Clock, AlertCircle, ArrowRight, Layout, List, Play, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Project, Phase, Requirement } from '@/types/project';

interface ProjectBoardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onSave: (project: Project) => void;
}

export function ProjectBoard({ project, onUpdate, onSave }: ProjectBoardProps) {
  const [activeView, setActiveView] = useState<'board' | 'list'>('board');
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(
    project.phases?.length > 0 ? project.phases[0].id : null
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Get current phase
  const activePhase = useMemo(() => 
    project.phases?.find(p => p.id === selectedPhaseId) || null, 
  [project.phases, selectedPhaseId]);

  // Get tasks for current phase
  const tasks = useMemo(() => activePhase?.requirements || [], [activePhase]);

  // Columns for Kanban
  const columns = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-500/10 border-gray-500/20' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'review', label: 'Review', color: 'bg-purple-500/10 border-purple-500/20' },
    { id: 'done', label: 'Done', color: 'bg-green-500/10 border-green-500/20' }
  ];

  // Update phase status
  const handlePhaseStatus = (status: Phase['status']) => {
    if (!activePhase) return;
    const updatedPhases = project.phases.map(p => 
      p.id === activePhase.id ? { ...p, status } : p
    );
    const updatedProject = { ...project, phases: updatedPhases };
    onUpdate(updatedProject);
    onSave(updatedProject);
  };

  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activePhase) return;

    const newTask: Requirement = {
      id: Date.now(),
      title: newTaskTitle,
      description: '',
      completed: false,
      priority: 'medium',
      status: 'todo',
      dependencies: [],
      tags: []
    };

    const updatedPhases = project.phases.map(p => {
      if (p.id === activePhase.id) {
        return { ...p, requirements: [...p.requirements, newTask] };
      }
      return p;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onUpdate(updatedProject);
    onSave(updatedProject);
    setNewTaskTitle('');
  };

  // Update task status
  const handleTaskStatus = (taskId: number, newStatus: Requirement['status']) => {
    if (!activePhase) return;

    const updatedPhases = project.phases.map(p => {
      if (p.id === activePhase.id) {
        const updatedReqs = p.requirements.map(r => {
          if (r.id === taskId) {
            return { 
              ...r, 
              status: newStatus,
              completed: newStatus === 'done'
            };
          }
          return r;
        });
        return { ...p, requirements: updatedReqs };
      }
      return p;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onUpdate(updatedProject);
    onSave(updatedProject);
  };

  // Delete task
  const handleDeleteTask = (taskId: number) => {
    if (!activePhase) return;
    if (!confirm('Delete this task?')) return;

    const updatedPhases = project.phases.map(p => {
      if (p.id === activePhase.id) {
        return { 
          ...p, 
          requirements: p.requirements.filter(r => r.id !== taskId) 
        };
      }
      return p;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onUpdate(updatedProject);
    onSave(updatedProject);
  };

  if (!project.phases || project.phases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 mb-4">No phases defined for this project.</p>
        <Button onClick={() => {
           // Logic to add default phase would be handled by parent or a separate modal
           // For now user should add phase via the main Overview or a new button here
           alert("Please add a phase in the Overview tab first.");
        }}>
          Create First Phase
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-dark/30 rounded-xl border border-white/5">
        {/* Phase Selector */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-white/40 uppercase font-bold tracking-wider mb-1">Current Phase</label>
            <select 
              value={selectedPhaseId || ''}
              onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
              className="bg-dark/50 border-white/10 text-white rounded-lg p-2 min-w-[200px] focus:ring-2 focus:ring-theme-primary"
            >
              {project.phases.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Phase Status Actions */}
          {activePhase && (
            <div className="flex items-center gap-2 mt-5">
              {activePhase.status === 'not-started' && (
                <Button 
                  size="sm" 
                  onClick={() => handlePhaseStatus('in-progress')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Phase
                </Button>
              )}
              {activePhase.status === 'in-progress' && (
                <Button 
                  size="sm" 
                  onClick={() => handlePhaseStatus('completed')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Phase
                </Button>
              )}
              <Badge className={cn(
                "ml-2",
                activePhase.status === 'in-progress' ? "bg-blue-500/20 text-blue-400" :
                activePhase.status === 'completed' ? "bg-green-500/20 text-green-400" :
                "bg-gray-500/20 text-gray-400"
              )}>
                {activePhase.status.replace('-', ' ')}
              </Badge>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex bg-dark/50 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setActiveView('board')}
            className={cn(
              "p-2 rounded-md transition-all",
              activeView === 'board' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
            )}
          >
            <Layout className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={cn(
              "p-2 rounded-md transition-all",
              activeView === 'list' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Creation Input */}
      <div className="mb-6">
        <form onSubmit={handleAddTask} className="relative">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="pl-10 py-6 bg-dark/30 border-white/10 text-white focus:border-theme-primary text-base"
          />
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Button 
            type="submit" 
            disabled={!newTaskTitle.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-xs"
          >
            Add Task
          </Button>
        </form>
      </div>

      {/* Board View */}
      {activeView === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full overflow-x-auto pb-4">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col h-full min-w-[280px] bg-dark/20 rounded-xl border border-white/5">
              {/* Column Header */}
              <div className={cn("p-3 border-b flex justify-between items-center", col.color)}>
                <span className="font-semibold text-sm text-white">{col.label}</span>
                <span className="bg-black/20 px-2 py-0.5 rounded text-xs font-mono opacity-70">
                  {tasks.filter(t => (t.status || 'todo') === col.id).length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                {tasks.filter(t => (t.status || 'todo') === col.id).map(task => (
                  <div 
                    key={task.id} 
                    className="bg-dark-secondary/80 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-white line-clamp-2">{task.title}</p>
                      <div className="relative">
                        <button className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity p-1">
                          <MoreVertical className="w-3 h-3" />
                        </button>
                        {/* Quick Actions (Hover) */}
                        <div className="absolute right-0 top-full mt-1 bg-dark border border-white/10 rounded-lg shadow-xl p-1 hidden group-hover:flex flex-col z-10 w-32">
                          {col.id !== 'done' && (
                            <button 
                              onClick={() => handleTaskStatus(task.id, 'done')}
                              className="text-xs text-left px-2 py-1.5 hover:bg-white/5 rounded text-green-400 flex items-center"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-2" /> Complete
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-xs text-left px-2 py-1.5 hover:bg-white/5 rounded text-red-400 flex items-center"
                          >
                            <AlertCircle className="w-3 h-3 mr-2" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1 text-[10px] text-white/60 bg-white/5 px-1.5 py-0.5 rounded-full">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[80px]">{task.assignedTo}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-white/30 border border-dashed border-white/10 px-1.5 py-0.5 rounded-full">
                          <User className="w-3 h-3" />
                          <span>Unassigned</span>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className={cn(
                          "flex items-center gap-1 text-[10px]",
                          new Date(task.dueDate) < new Date() ? "text-red-400" : "text-white/40"
                        )}>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                        </div>
                      )}
                    </div>

                    {/* Move Actions (Simple buttons for now) */}
                    <div className="flex gap-1 mt-3 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.id !== 'todo' && (
                        <button 
                          onClick={() => handleTaskStatus(task.id, col.id === 'done' ? 'review' : col.id === 'review' ? 'in-progress' : 'todo')}
                          className="p-1 hover:bg-white/10 rounded text-white/60" title="Move Back"
                        >
                          <ArrowRight className="w-3 h-3 rotate-180" />
                        </button>
                      )}
                      <div className="flex-1" />
                      {col.id !== 'done' && (
                        <button 
                          onClick={() => handleTaskStatus(task.id, col.id === 'todo' ? 'in-progress' : col.id === 'in-progress' ? 'review' : 'done')}
                          className="p-1 hover:bg-white/10 rounded text-green-400" title="Move Forward"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View (Simplified Backlog) */}
      {activeView === 'list' && (
        <div className="bg-dark/20 rounded-xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-3 bg-white/5 text-xs font-semibold text-white/60 border-b border-white/10">
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Due Date</div>
          </div>
          <div className="divide-y divide-white/5">
            {tasks.map(task => (
              <div key={task.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-white/5 transition-colors">
                <div className="col-span-6 flex items-center gap-3">
                  <button 
                    onClick={() => handleTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all",
                      task.status === 'done' ? "bg-green-500/20 border-green-500/50 text-green-400" : "border-white/20"
                    )}
                  >
                    {task.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <span className={cn("text-sm text-white", task.status === 'done' && "line-through text-white/40")}>
                    {task.title}
                  </span>
                </div>
                <div className="col-span-2">
                  <Badge className={cn(
                    "text-[10px] px-2 py-0.5",
                    task.status === 'done' ? "bg-green-500/10 text-green-400" :
                    task.status === 'in-progress' ? "bg-blue-500/10 text-blue-400" :
                    task.status === 'review' ? "bg-purple-500/10 text-purple-400" :
                    "bg-gray-500/10 text-gray-400"
                  )}>
                    {task.status || 'todo'}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm text-white/60 truncate">
                  {task.assignedTo || '-'}
                </div>
                <div className="col-span-2 text-sm text-white/60">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="p-8 text-center text-white/40 text-sm">
                No tasks found. Add one above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
