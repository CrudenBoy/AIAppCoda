// File: routes/appContent.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { contentRows } = req.body;
console.log("📥 Incoming contentRows:", contentRows);
  const docId = req.headers['x-doc-id'];
  const regKey = req.headers['authorization']?.split('Bearer ')[1];

  if (!docId || !regKey) {
    return res.status(400).json({ success: false, message: 'Missing headers' });
  }

  // Optional: Validate docId/regKey from doc_registry here

  try {
    // Optional: Delete existing content for this docId
    await db.query('DELETE FROM db_app_content WHERE docid = $1', [docId]);

    for (let row of contentRows) {
      await db.query(`
        INSERT INTO db_app_content (contentid, section, docid, dialogue, knowledge, image, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        row.contentId,
        row.section,
        docId,
        row.dialogue,
        row.knowledge,
        row.image,
        row.order
      ]);
    }

    res.status(201).json({ success: true, message: 'Content inserted successfully' });
  } catch (err) {
    console.error('Failed to insert content:', err);
    res.status(500).json({ success: false, message: 'Server error inserting content' });
  }
});

module.exports = router;