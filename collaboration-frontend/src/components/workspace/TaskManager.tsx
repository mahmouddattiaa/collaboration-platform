// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckSquare, Square, Trash2, Plus, Calendar, User, AlertCircle, Filter, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Task Priority Colors
const PRIORITY_COLORS = {
  low: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  high: 'text-red-400 bg-red-400/10 border-red-400/30'
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  createdAt: string;
}

interface TaskManagerProps {
  roomId: string;
}

export function TaskManager({ roomId }: TaskManagerProps) {
  // State Management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'dueDate'>('date');

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem(`tasks-${roomId}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [roomId]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(`tasks-${roomId}`, JSON.stringify(tasks));
    } else {
      localStorage.removeItem(`tasks-${roomId}`);
    }
  }, [tasks, roomId]);

  // Add new task - Memoized to prevent recreation
  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      description: newTaskDescription,
      completed: false,
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      dueDate: newTaskDueDate,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskAssignee('');
    setNewTaskDueDate('');
  }, [newTaskTitle, newTaskDescription, newTaskPriority, newTaskAssignee, newTaskDueDate]);

  // Toggle task completion
  const handleToggleTask = useCallback((taskId: number) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }, []);

  // Delete task
  const handleDeleteTask = useCallback((taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  // Filter and sort tasks - Memoized for performance
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(task => !task.completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Default: sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [tasks, filterStatus, filterPriority, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    
    return { total, completed, active, highPriority };
  }, [tasks]);

  // Check if task is overdue
  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  // Format due date
  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Statistics */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckSquare className="w-8 h-8 text-theme-primary" />
          <h2 className="text-2xl font-bold text-white">Task Management</h2>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-secondary/50 backdrop-blur-xl border border-white/10 rounded-lg p-4">
            <div className="text-white/60 text-sm mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-dark-secondary/50 backdrop-blur-xl border border-blue-400/30 rounded-lg p-4">
            <div className="text-blue-400/80 text-sm mb-1">Active</div>
            <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
          </div>
          <div className="bg-dark-secondary/50 backdrop-blur-xl border border-green-400/30 rounded-lg p-4">
            <div className="text-green-400/80 text-sm mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          </div>
          <div className="bg-dark-secondary/50 backdrop-blur-xl border border-red-400/30 rounded-lg p-4">
            <div className="text-red-400/80 text-sm mb-1">High Priority</div>
            <div className="text-2xl font-bold text-red-400">{stats.highPriority}</div>
          </div>
        </div>
      </div>

      {/* Create New Task Form */}
      <div className="bg-dark-secondary/50 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Create New Task</h3>
        
        <div className="space-y-4">
          {/* Task Title */}
          <div>
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="bg-dark/50 text-white placeholder:text-white/40 border-white/10"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
          </div>

          {/* Task Description */}
          <div>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task description (optional)..."
              className="w-full bg-dark/50 text-white placeholder:text-white/40 border border-white/10 rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-theme-primary/50 resize-none"
            />
          </div>

          {/* Task Metadata */}
          <div className="grid grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-full bg-dark/50 text-white border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">Assign to</label>
              <Input
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                placeholder="Name (optional)"
                className="bg-dark/50 text-white placeholder:text-white/40 border-white/10"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">Due Date</label>
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-dark/50 text-white border-white/10"
              />
            </div>
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="w-full bg-theme-primary hover:bg-theme-primary/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-dark-secondary/50 backdrop-blur-xl border border-white/10 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-white/60" />
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                filterStatus === 'all'
                  ? 'bg-theme-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                filterStatus === 'active'
                  ? 'bg-theme-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                filterStatus === 'completed'
                  ? 'bg-theme-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              Completed
            </button>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="bg-dark/50 text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <div className="w-px h-6 bg-white/10" />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-dark/50 text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-white/40">
              {filterStatus !== 'all' || filterPriority !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks yet. Create your first task above!'}
            </p>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'bg-dark-secondary/50 backdrop-blur-xl border rounded-lg p-4 transition-all group',
                task.completed
                  ? 'border-white/5 opacity-60'
                  : 'border-white/10 hover:border-theme-primary/30'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="flex-shrink-0 mt-1"
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-theme-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-white/40 hover:text-theme-primary transition-colors" />
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4
                      className={cn(
                        'text-lg font-medium',
                        task.completed
                          ? 'text-white/40 line-through'
                          : 'text-white'
                      )}
                    >
                      {task.title}
                    </h4>

                    {/* Priority Badge */}
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium border flex-shrink-0',
                        PRIORITY_COLORS[task.priority]
                      )}
                    >
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-white/60 text-sm mb-3 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    {/* Assignee */}
                    {task.assignee && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{task.assignee}</span>
                      </div>
                    )}

                    {/* Due Date */}
                    {task.dueDate && (
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          isOverdue(task.dueDate) && !task.completed && 'text-red-400'
                        )}
                      >
                        {isOverdue(task.dueDate) && !task.completed ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Calendar className="w-4 h-4" />
                        )}
                        <span>
                          {formatDueDate(task.dueDate)}
                          {isOverdue(task.dueDate) && !task.completed && ' (Overdue)'}
                        </span>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-400/10 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
