const express = require("express");
const router = express.Router();
const validateTaskId = require("../middleware/validateTaskId");

// In-memory tasks database
// Each task contains: id (number), title (string), description (string), completed (boolean)
let tasks = [
  {
    id: 1,
    title: "Learn Express.js",
    description: "Study Express fundamentals, routing, and middleware architecture",
    completed: false,
  },
  {
    id: 2,
    title: "Build RESTful API",
    description: "Implement CRUD endpoints with proper HTTP status codes",
    completed: true,
  },
  {
    id: 3,
    title: "Implement Custom Middleware",
    description: "Add request logger, Content-Type validator, and task ID validator",
    completed: false,
  },
];

// Apply ID validation middleware to all routes containing :id parameter
router.use("/:id", validateTaskId);

/**
 * GET /tasks
 * Retrieve all tasks from memory.
 * Status: 200 OK
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

/**
 * GET /tasks/:id
 * Retrieve a single task by its numeric ID.
 * Status: 200 OK or 404 Not Found
 */
router.get("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Task with ID ${req.taskId} not found`,
    });
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

/**
 * POST /tasks
 * Create a new task.
 * Requires: title (non-empty string)
 * Optional: description (string), completed (boolean)
 * Status: 201 Created or 400 Bad Request
 */
router.post("/", (req, res) => {
  const { title, description, completed } = req.body;

  // Validation: title is mandatory and must not be empty
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title is required and must be a non-empty string.",
    });
  }

  // Generate incremental ID based on existing task IDs
  const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;

  const newTask = {
    id: newId,
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    completed: Boolean(completed),
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: newTask,
  });
});

/**
 * PUT /tasks/:id
 * Update an existing task by its numeric ID.
 * Accepts: title, description, completed
 * Status: 200 OK, 400 Bad Request, or 404 Not Found
 */
router.put("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: `Task with ID ${req.taskId} not found`,
    });
  }

  const { title, description, completed } = req.body;

  // Ensure at least one field is provided for update
  if (title === undefined && description === undefined && completed === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least one field (title, description, or completed) must be provided to update.",
    });
  }

  // Validate title if supplied
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title must be a non-empty string.",
      });
    }
    task.title = title.trim();
  }

  // Update description if supplied
  if (description !== undefined) {
    task.description = typeof description === "string" ? description.trim() : "";
  }

  // Update completed status if supplied
  if (completed !== undefined) {
    task.completed = Boolean(completed);
  }

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

/**
 * DELETE /tasks/:id
 * Remove a task from memory by its numeric ID.
 * Status: 200 OK or 404 Not Found
 */
router.delete("/:id", (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Task with ID ${req.taskId} not found`,
    });
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: deletedTask,
  });
});

module.exports = router;