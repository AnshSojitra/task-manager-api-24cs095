/**
 * Middleware to validate task IDs before controller logic.
 * Ensures the :id parameter is a strictly positive integer.
 * Fulfills Practical 4 Post-Lab Requirement.
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  // Check if ID is a valid positive integer string
  if (!/^\d+$/.test(id) || parseInt(id, 10) <= 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid task ID '${id}'. Task ID must be a positive integer.`,
    });
  }

  // Pre-parse and attach to request object
  req.taskId = parseInt(id, 10);
  next();
};

module.exports = validateTaskId;
