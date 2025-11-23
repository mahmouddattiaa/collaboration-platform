const Project = require("../models/Project");
const { BadRequestError, NotFoundError } = require('../utils/errors');
const logActivity = require('../utils/activityLogger');

// Get all projects for a room
exports.getProjects = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new BadRequestError("Room ID is required");
    }

    const projects = await Project.find({ roomId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Get single project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      throw new BadRequestError("Project ID is required");
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Create new project
exports.createProject = async (req, res, next) => {
  try {
    const { roomId, ...projectData } = req.body;

    if (!roomId || !projectData.name) {
      throw new BadRequestError("Room ID and project name are required");
    }

    const newProject = new Project({
      ...projectData,
      roomId,
      createdBy: req.user._id,
      activityLog: [
        {
          action: "Project created",
          user: req.user.name || req.user.email,
          timestamp: new Date(),
          details: "Project was created",
        },
      ],
    });

    await newProject.save();

    // Broadcast project creation
    const io = req.app.get("io");
    if (io) {
      io.to(roomId).emit("project-created", newProject);
    }

    await logActivity(
      io,
      roomId,
      req.user._id,
      'CREATED_PROJECT',
      `Project "${newProject.name}" created`,
      { projectId: newProject._id }
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    if (!projectId) {
      throw new BadRequestError("Project ID is required");
    }

    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Clean phases data - remove MongoDB's _id field conflicts
    if (updateData.phases && Array.isArray(updateData.phases)) {
      updateData.phases = updateData.phases.map((phase) => {
        const cleanPhase = { ...phase };
        // Remove _id to let MongoDB generate it, keep our custom 'id' field
        delete cleanPhase._id;
        return cleanPhase;
      });
    }

    // Update the project fields directly
    Object.keys(updateData).forEach((key) => {
      project[key] = updateData[key];
    });

    // Add activity log entry
    const activityEntry = {
      action: "Project updated",
      user: req.user?.name || req.user?.email || "Unknown",
      timestamp: new Date(),
      details: "Project details were modified",
    };

    // Add activity log
    if (!project.activityLog) {
      project.activityLog = [];
    }
    project.activityLog.push(activityEntry);

    // Save the project
    await project.save();

    // Broadcast project update
    const io = req.app.get("io");
    if (io) {
      io.to(project.roomId.toString()).emit("project-updated", project);
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      throw new BadRequestError("Project ID is required");
    }

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Broadcast project deletion
    const io = req.app.get("io");
    if (io) {
      io.to(project.roomId.toString()).emit("project-deleted", { projectId });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Bulk operations
exports.bulkUpdateProjects = async (req, res, next) => {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations) || operations.length === 0) {
      throw new BadRequestError("Operations array is required");
    }

    const results = await Promise.all(
      operations.map(async (op) => {
        try {
          if (op.type === "update") {
            return await Project.findByIdAndUpdate(op.projectId, op.data, {
              new: true,
            });
          } else if (op.type === "delete") {
            return await Project.findByIdAndDelete(op.projectId);
          }
        } catch (err) {
          return { error: err.message, projectId: op.projectId };
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "Bulk operations completed",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
