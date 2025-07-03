require("dotenv").config();
const express = require('express');
const db = require('./db'); // Import our database module
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();

// Whitelist specific origins for CORS to allow localhost and your deployed frontend
const whitelist = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'https://knowledge-base-interactive-slides--chat-4m5s6.ondigitalocean.app' // Your live frontend URL
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

const port = process.env.PORT || 8080;
app.use(express.json());

// --- Master Authentication Middleware (Using Live Database) ---
const masterAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication error: Missing Bearer token.' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const result = await db.query('SELECT * FROM users WHERE "apiToken" = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Authentication error: Invalid API token.' });
    }
    req.user = result.rows[0]; // Attach user data to the request
    next();
  } catch (err) {
    console.error('Authentication database error:', err);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

// --- API Routes ---

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// User Identification Route
app.get('/me', masterAuth, (req, res) => {
  res.json({ email: req.user.email });
});

// Get Tasks Route
app.get('/tasks', masterAuth, async (req, res) => {
  const { docId } = req.query;
  try {
    const result = await db.query('SELECT * FROM tasks WHERE "docId" = $1', [docId]);
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

// Get Responses Route
app.get('/responses', masterAuth, async (req, res) => {
  const { docId } = req.query;
  try {
    const result = await db.query('SELECT * FROM responses WHERE "docId" = $1', [docId]);
    res.json({ responses: result.rows });
  } catch (err) {
    console.error('Error fetching responses:', err);
    res.status(500).json({ message: 'Failed to fetch responses.' });
  }
});

// GET /app_content - Fetches all slide content for a given docId, sorted by displayOrder
app.get('/app_content', async (req, res) => {
  const { docId } = req.query;

  if (!docId) {
    return res.status(400).json({ message: 'A docId query parameter is required.' });
  }

  try {
    const query = `
      SELECT
        "contentId",
        "docId",
        "section",
        "dialogue",
        "knowledge",
        "image",
        "displayOrder",
        "presentationtext"
      FROM app_content
      WHERE "docId" = $1
      ORDER BY "displayOrder" ASC;
    `;
    const { rows } = await db.pool.query(query, [docId]);

    const mappedRows = rows.map(row => ({
        contentId: row.contentId,
        docId: row.docId,
        title: row.section,
        dialogue: row.dialogue,
        knowledge: row.knowledge,
        imageFilename: row.image,
        presentationtext: row.presentationtext
    }));

    res.status(200).json(mappedRows);

  } catch (error) {
    console.error('Failed to fetch app content:', error);
    res.status(500).json({ message: 'Failed to retrieve content from database.' });
  }
});

// POST /app_content - Receives data from the Coda "SendAppContent" action
app.post('/app_content', masterAuth, async (req, res) => {
  const { docId, contentRows } = req.body;

  if (!docId || !Array.isArray(contentRows) || contentRows.length === 0) {
    return res.status(400).json({ message: 'Invalid payload. docId and a non-empty contentRows array are required.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM app_content WHERE "docId" = $1', [docId]);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const processedRows = await Promise.all(contentRows.map(async (row) => {
      const { knowledge, dialogueinstruction, presentationinstruction } = row;

      // Step 1: Generate Dialogue
      const dialoguePrompt = `${dialogueinstruction}: "${knowledge}"`;
      const dialogueResult = await model.generateContent(dialoguePrompt);
      const dialogue = dialogueResult.response.text();

      // Step 2: Generate Presentation Text
      const presentationPrompt = `${presentationinstruction}: "${dialogue}"`;
      const presentationResult = await model.generateContent(presentationPrompt);
      const presentationtext = presentationResult.response.text();

      // Step 3: Augment the Row
      return {
        ...row,
        dialogue,
        presentationtext,
      };
    }));

    const insertPromises = processedRows.map(row => {
      const { contentid, section, knowledge, image, displayorder, dialogue, presentationtext, dialogueinstruction, presentationinstruction } = row;
      const query = `
        INSERT INTO app_content ("contentId", "docId", "section", "knowledge", "image", "displayOrder", "dialogue", "presentationtext", "dialogueInstruction", "presentationInstruction")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      const values = [contentid, docId, section, knowledge, image, displayorder, dialogue, presentationtext, dialogueinstruction, presentationinstruction];
      return client.query(query, values);
    });

    await Promise.all(insertPromises);
    await client.query('COMMIT');
    res.status(201).json({ message: `Successfully saved ${processedRows.length} rows.` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Database save error:", error);
    res.status(500).json({ message: "Failed to save content.", error: error.message });
  } finally {
    client.release();
  }
});

// POST /tasks - Receives a new task from the frontend AI app
app.post('/tasks', async (req, res) => {
  const { docId, taskId, title, description, status } = req.body;
  if (!docId || !taskId || !title) {
    return res.status(400).json({ message: 'docId, taskId, and title are required.' });
  }
  try {
    const query = `
      INSERT INTO tasks ("docId", "taskId", "title", "description", "status", "createdAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    await db.pool.query(query, [docId, taskId, title, description, status || 'New']);
    res.status(201).json({ message: 'Task created successfully.' });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Failed to create task.' });
  }
});

// POST /responses - Receives a new response from the frontend AI app
app.post('/responses', async (req, res) => {
  const { docId, responseId, content, taskId } = req.body;
  if (!docId || !responseId || !content) {
    return res.status(400).json({ message: 'docId, responseId, and content are required.' });
  }
  try {
    const query = `
      INSERT INTO responses ("docId", "responseId", "content", "taskId", "submittedAt")
      VALUES ($1, $2, $3, $4, NOW())
    `;
    await db.pool.query(query, [docId, responseId, content, taskId]);
    res.status(201).json({ message: 'Response created successfully.' });
  } catch (err) {
    console.error('Error creating response:', err);
    res.status(500).json({ message: 'Failed to create response.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});