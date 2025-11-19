const Project = require("../models/Project");
const mongoose = require("mongoose");

// Get all projects for a room
exports.getProjects = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    const projects = await Project.find({ roomId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

// Get single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { roomId, ...projectData } = req.body;

    if (!roomId || !projectData.name) {
      return res.status(400).json({
        success: false,
        message: "Room ID and project name are required",
      });
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

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Clean phases data - remove MongoDB's _id field conflicts
    if (updateData.phases && Array.isArray(updateData.phases)) {
      updateData.phases = updateData.phases.map(phase => {
        const cleanPhase = { ...phase };
        // Remove _id to let MongoDB generate it, keep our custom 'id' field
        delete cleanPhase._id;
        return cleanPhase;
      });
    }

    // Update the project fields directly
    Object.keys(updateData).forEach(key => {
      project[key] = updateData[key];
    });
    
    // Add activity log entry
    const activityEntry = {
      action: "Project updated",
      user: req.user?.name || req.user?.email || 'Unknown',
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

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
};

// Bulk operations
exports.bulkUpdateProjects = async (req, res) => {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Operations array is required",
      });
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
    console.error("Bulk update error:", error);
    res.status(500).json({
      success: false,
      message: "Error performing bulk operations",
      error: error.message,
    });
  }
};
