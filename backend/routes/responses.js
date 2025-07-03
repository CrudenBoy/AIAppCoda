const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authorizePush, logActivity } = require('../utils');

const CODA_API_TOKEN = process.env.CODA_API_TOKEN;
const CODA_API_BASE = 'https://coda.io/apis/v1';

// POST /api/responses
router.post('/', authorizePush, async (req, res) => {
  const { data } = req.body;
  const { docId, regKey: docRegKey } = req.docDetails; // docId and regKey from authorizePush middleware

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    await logActivity(docId, docRegKey, req.path, 400, 'Invalid or empty response data object received.');
    return res.status(400).json({ message: 'Response data must be a non-empty JSON object.' });
  }

  try {
    const response = await fetch(`${CODA_API_BASE}/docs/${docId}/tables/db_Responses/rows`, {
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
      await logActivity(docId, docRegKey, req.path, response.status, `Coda API error while writing response: ${errorText}`);
      return res.status(response.status).json({ message: `Failed to write response to Coda: ${errorText}` });
    }

    const responseData = await response.json();
    await logActivity(docId, docRegKey, req.path, 200, 'Response written to Coda successfully.');
    res.status(200).json({ message: 'Response written to Coda', responseId: data.ResponseID, codaResponse: responseData });

  } catch (error) {
    console.error('Response write failed:', error);
    await logActivity(docId, docRegKey, req.path, 500, `Response write failed: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error: Failed to write response to Coda.' });
  }
});

module.exports = router;