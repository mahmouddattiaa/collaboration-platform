// collaboration-frontend/src/types/project.ts

export interface Requirement {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  dependencies: number[];
  tags: string[];
}

export interface Phase {
  id: number;
  name: string;
  description?: string;
  requirements: Requirement[];
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'on-hold';
  order?: number;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  actualCost?: number;
  parentPhaseId?: number;
  dependsOn: number[];
  owner?: string;
  team: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'sequential' | 'parallel' | 'optional' | 'milestone';
  estimatedHours?: number;
  actualHours?: number;
  deliverables: string[];
  color?: string;
  notes?: string;
  tags: string[];
  progress: number;
  blockers: string[];
}

export interface Milestone {
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  completedDate?: Date;
  deliverables: string[];
}

export interface TeamMember {
  name: string;
  role?: string;
  email?: string;
  avatar?: string;
  workload?: number;
  skills: string[];
}

export interface Risk {
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  mitigation?: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
  owner?: string;
}

export interface Issue {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Comment {
  author: string;
  content: string;
  timestamp: Date;
  edited: boolean;
}

export interface Attachment {
  name: string;
  type: 'file' | 'link';
  url: string;
  uploadedBy?: string;
  uploadedAt: Date;
  size?: number;
}

export interface ActivityLog {
  action: string;
  user?: string;
  timestamp: Date;
  details?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  tags: string[];
  phases: Phase[];
  milestones: Milestone[];
  team: TeamMember[];
  risks: Risk[];
  issues: Issue[];
  comments: Comment[];
  attachments: Attachment[];
  activityLog: ActivityLog[];
  budget?: number;
  actualCost?: number;
  client?: string;
  projectManager?: string;
  category?: string;
  healthScore?: number;
  roomId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
