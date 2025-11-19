const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema({
  id: { type: Number }, // Custom numeric ID from frontend
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  assignedTo: String,
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  status: {
    type: String,
    enum: ["todo", "in-progress", "review", "done", "blocked"],
    default: "todo",
  },
  dependencies: [Number],
  tags: [String],
});

const phaseSchema = new mongoose.Schema({
  id: { type: Number }, // Custom numeric ID from frontend
  name: { type: String, required: true },
  description: String,
  requirements: [requirementSchema],
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed", "blocked", "on-hold"],
    default: "not-started",
  },
  order: Number,
  startDate: Date,
  endDate: Date,
  budget: Number,
  actualCost: Number,
  // Enhanced phase fields
  parentPhaseId: Number, // For hierarchical structure
  dependsOn: [Number], // Phase dependencies
  owner: String, // Phase owner/lead
  team: [String], // Team members assigned
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  type: {
    type: String,
    enum: ["sequential", "parallel", "optional", "milestone"],
    default: "sequential",
  },
  estimatedHours: Number,
  actualHours: Number,
  deliverables: [String],
  color: String, // Custom color for visual differentiation
  notes: String,
  tags: [String],
  progress: { type: Number, default: 0 },
  blockers: [String],
});

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  dueDate: Date,
  completedDate: Date,
  deliverables: [String],
});

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  email: String,
  avatar: String,
  workload: Number,
  skills: [String],
});

const riskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  likelihood: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  mitigation: String,
  status: {
    type: String,
    enum: ["identified", "mitigating", "resolved", "accepted"],
    default: "identified",
  },
  owner: String,
});

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed"],
    default: "open",
  },
  assignedTo: String,
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
});

const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
});

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "link"], required: true },
  url: { type: String, required: true },
  uploadedBy: String,
  uploadedAt: { type: Date, default: Date.now },
  size: Number,
});

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: String,
  timestamp: { type: Date, default: Date.now },
  details: String,
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["planning", "active", "on-hold", "completed", "cancelled"],
      default: "planning",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    startDate: Date,
    dueDate: Date,
    completedDate: Date,
    tags: [String],
    phases: [phaseSchema],
    milestones: [milestoneSchema],
    team: [teamMemberSchema],
    risks: [riskSchema],
    issues: [issueSchema],
    comments: [commentSchema],
    attachments: [attachmentSchema],
    activityLog: [activityLogSchema],
    budget: Number,
    actualCost: Number,
    client: String,
    projectManager: String,
    category: String,
    healthScore: Number,

    // Room association
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollaborationRoom",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
projectSchema.index({ roomId: 1, createdBy: 1 });
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ tags: 1 });

module.exports = mongoose.model("Project", projectSchema);
