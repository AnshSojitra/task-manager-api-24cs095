require("dotenv").config();
const express = require("express");
const app = express();

const logger = require("./middleware/logger");
const validateContentType = require("./middleware/validateContentType");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/tasks");

const PORT = process.env.PORT || 5000;

// 1. Global request logging middleware (method, URL, ISO timestamp)
app.use(logger);

// 2. Reject POST/PUT requests without Content-Type: application/json (Post-lab requirement)
app.use(validateContentType);

// 3. JSON body parsing middleware
app.use(express.json());

// API Info / Welcome endpoint
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management REST API - CHARUSAT ITUE301 Practical 4",
    student: {
      name: "Ansh Sojitra",
      studentId: "24CS095",
      academicYear: "2026-27",
    },
    endpoints: {
      "GET /tasks": "Retrieve all tasks",
      "GET /tasks/:id": "Retrieve a specific task by ID",
      "POST /tasks": "Create a new task (Content-Type: application/json required)",
      "PUT /tasks/:id": "Update an existing task (Content-Type: application/json required)",
      "DELETE /tasks/:id": "Delete a task by ID",
    },
  });
});

// 4. Mount task management routes
app.use("/tasks", taskRoutes);

// 5. 404 Handler for unknown routes (structured JSON response)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Global error handling middleware (must be registered last)
app.use(errorHandler);

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;