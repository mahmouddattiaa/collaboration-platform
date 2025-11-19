const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  bulkUpdateProjects,
} = require("../controllers/projectController");

// All routes require authentication
router.get("/room/:roomId", auth, getProjects);
router.get("/:projectId", auth, getProjectById);
router.post("/", auth, createProject);
router.put("/:projectId", auth, updateProject);
router.delete("/:projectId", auth, deleteProject);
router.post("/bulk", auth, bulkUpdateProjects);

module.exports = router;
