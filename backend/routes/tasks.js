const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authorizePush, logActivity } = require('../utils');

const CODA_API_TOKEN = process.env.CODA_API_TOKEN;
const CODA_API_BASE = 'https://coda.io/apis/v1';

// POST /api/tasks
router.post('/', authorizePush, async (req, res) => {
  const { data } = req.body;
  const { docId, regKey: docRegKey } = req.docDetails; // docId and regKey from authorizePush middleware

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    await logActivity(docId, docRegKey, req.path, 400, 'Invalid or empty task data object received.');
    return res.status(400).json({ message: 'Task data must be a non-empty JSON object.' });
  }

  try {
    const response = await fetch(`${CODA_API_BASE}/docs/${docId}/tables/db_Tasks/rows`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CODA_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rows: [{
          cells: Object.entries(data).map(([col, val]) => ({ column: col, value: val }))
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      await logActivity(docId, docRegKey, req.path, response.status, `Coda API error while writing task: ${errorText}`);
      // It's important to return the actual error from Coda if possible, or a generic one.
      return res.status(response.status).json({ message: `Failed to write task to Coda: ${errorText}` });
    }

    const responseData = await response.json();
    // Assuming Coda API returns some useful data, like the ID of the created row(s)
    // For now, we'll just use the TaskID from the input if available.

    await logActivity(docId, docRegKey, req.path, 200, 'Task written to Coda successfully.');
    res.status(200).json({ message: 'Task written to Coda', taskId: data.TaskID, codaResponse: responseData });

  } catch (error) {
    console.error('Task write failed:', error);
    await logActivity(docId, docRegKey, req.path, 500, `Task write failed: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error: Failed to write task to Coda.' });
  }
});

module.exports = router;