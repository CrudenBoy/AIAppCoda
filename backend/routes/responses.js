const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/responses - Create a new response
// masterAuth middleware is applied in server.js, so req.user is available here.
router.post('/', async (req, res) => {
  const { docId, responseId, content } = req.body;

  // Validate that the user object was attached by the middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication error: User not found after auth middleware.' });
  }

  // Validate the payload from the request body
  if (!docId || !responseId || !content) {
    return res.status(400).json({ message: 'docId, responseId, and content are required fields.' });
  }

  try {
    const query = `
      INSERT INTO responses ("docId", "responseId", "content", "submittedAt")
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const values = [docId, responseId, content];
    
    const { rows } = await db.pool.query(query, values);

    res.status(201).json({ message: 'Response created successfully.', response: rows[0] });
  } catch (error) {
    console.error('Error creating response:', error);
    if (error.code === '23505') { // Handle duplicate key error
      return res.status(409).json({ message: `A response with responseId '${responseId}' already exists.` });
    }
    res.status(500).json({ message: 'Failed to create response in database.' });
  }
});

module.exports = router;