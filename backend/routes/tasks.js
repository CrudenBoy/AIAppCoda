const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/tasks - Create a new task
// masterAuth middleware is applied in server.js, so req.user is available here.
router.post('/', async (req, res) => {
  const { docId, taskId, title, description, status } = req.body;

  // Validate that the user object was attached by the middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication error: User not found after auth middleware.' });
  }

  // Validate the payload from the request body
  if (!docId || !taskId || !title) {
    return res.status(400).json({ message: 'docId, taskId, and title are required fields in the request body.' });
  }

  try {
    const query = `
      INSERT INTO tasks ("docId", "taskId", "title", "description", "status", "createdAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;
    const values = [docId, taskId, title, description, status || 'New'];
    
    const { rows } = await db.pool.query(query, values);

    res.status(201).json({ message: 'Task created successfully.', task: rows[0] });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.code === '23505') { // Handle duplicate key error
      return res.status(409).json({ message: `A task with taskId '${taskId}' already exists.` });
    }
    res.status(500).json({ message: 'Failed to create task in database.' });
  }
});

module.exports = router;