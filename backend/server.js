require("dotenv").config();
const express = require('express');
const db = require('./db'); // Import our database module
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');
const { callGeminiAPI } = require('./utils');

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
    const result = await db.query('SELECT "userId", email, credits FROM users WHERE "apiToken" = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Authentication error: Invalid API token.' });
    }
    req.user = result.rows[0]; // Attach user object { userId, email, credits } to the request
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
app.get('/api/me', masterAuth, (req, res) => {
  res.json({ email: req.user.email });
});

// --- User Usage and Upgrade Endpoints ---

// Get User Credit Usage
app.get('/api/v1/user/usage', masterAuth, (req, res) => {
  res.json({ credits: req.user.credits });
});

// Upgrade User Plan (Placeholder)
app.post('/api/v1/user/upgrade', masterAuth, (req, res) => {
  res.status(200).json({ message: "Upgrade path not yet implemented." });
});

// Get Tasks Route
app.get('/api/tasks', masterAuth, async (req, res) => {
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
app.get('/api/responses', masterAuth, async (req, res) => {
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
app.get('/api/app_content', async (req, res) => {
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
app.post('/api/app_content', masterAuth, async (req, res) => {
  const { docId, contentRows } = req.body;

  if (!docId || !Array.isArray(contentRows) || contentRows.length === 0) {
    return res.status(400).json({ message: 'Invalid payload. docId and a non-empty contentRows array are required.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM app_content WHERE "docId" = $1', [docId]);

    const processedRows = await Promise.all(
      contentRows.map(async (row) => {
        const { knowledge, dialogueinstruction, presentationinstruction } = row;

        // Step 1: Use the 'knowledge' field to generate the 'dialogue'
        const dialoguePrompt = `${dialogueinstruction}: "${knowledge}"`;
        const dialogue = await callGeminiAPI(dialoguePrompt);

        // Step 2: Use the new 'dialogue' to generate the 'presentationtext'
        const presentationPrompt = `${presentationinstruction}: "${dialogue}"`;
        const presentationtext = await callGeminiAPI(presentationPrompt);

        // Verification Step: Log both generated fields to the console
        console.log({ dialogue, presentationtext });

        // Return the row, augmented with the new dialogue and presentationtext.
        return {
          ...row,
          dialogue,
          presentationtext,
        };
      })
    );

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

// PUT /app_content/instructions - Updates dialogue and presentation instructions for a docId
app.put('/api/app_content/instructions', masterAuth, async (req, res) => {
  const { docId, dialogueInstruction, presentationInstruction } = req.body;

  if (!docId || !dialogueInstruction || !presentationInstruction) {
    return res.status(400).json({ message: 'docId, dialogueInstruction, and presentationInstruction are required.' });
  }

  try {
    const query = `
      UPDATE app_content
      SET "dialogueInstruction" = $1, "presentationInstruction" = $2
      WHERE "docId" = $3
    `;
    const { rowCount } = await db.pool.query(query, [dialogueInstruction, presentationInstruction, docId]);

    if (rowCount === 0) {
      return res.status(404).json({ message: `No content found for docId: ${docId} to update.` });
    }

    res.status(200).json({ message: `Successfully updated instructions for ${rowCount} rows.` });
  } catch (error) {
    console.error('Failed to update instructions:', error);
    res.status(500).json({ message: 'Failed to update instructions in database.' });
  }
});

// POST /tasks - Receives a new task from the frontend AI app
app.post('/api/tasks', async (req, res) => {
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
app.post('/api/responses', async (req, res) => {
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

// --- AI Gateway Endpoint ---
app.post('/api/v1/chat/:agent_slug', masterAuth, async (req, res) => {
  const { agent_slug } = req.params;
  const userRequestData = req.body;
  const { userId, credits } = req.user; // User object from masterAuth

  if (!agent_slug) {
    return res.status(400).json({ message: 'Agent slug is required.' });
  }

  // --- Task 10.3: Credit Check (Pre-Proxy) ---
  // Before making the fetch call, check if the user has enough credits.
  if (credits <= 0) {
    return res.status(429).json({ error: "Insufficient credits. Please upgrade your plan." });
  }

  try {
    // 1. Look up the agent in the database to get its UUID and internal ID
    const agentQuery = 'SELECT agent_id, do_agent_uuid FROM ai_agents WHERE agent_slug = $1';
    const agentResult = await db.query(agentQuery, [agent_slug]);

    if (agentResult.rows.length === 0) {
      return res.status(404).json({ message: `Agent with slug '${agent_slug}' not found.` });
    }

    const { agent_id, do_agent_uuid } = agentResult.rows[0];

    // 2. Prepare and proxy the request to DigitalOcean GenAI Platform
    const doApiUrl = process.env.DO_GENAI_API_URL;
    const doApiKey = process.env.DO_API_KEY;

    if (!doApiUrl || !doApiKey) {
      console.error('DO_GENAI_API_URL or DO_API_KEY is not set in environment variables.');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    // Securely construct the payload, only forwarding expected fields.
    const { messages, stream, temperature } = userRequestData;
    const proxyPayload = {
      messages,
      stream,
      temperature,
      model: do_agent_uuid, // Use the fetched UUID as the model
    };

    const response = await fetch(doApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doApiKey}`,
      },
      body: JSON.stringify(proxyPayload),
    });

    // Error handling for the proxied request.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`DigitalOcean API error: ${response.status} ${response.statusText}`, errorBody);
      return res.status(response.status).json({ message: 'Failed to proxy request to AI provider.' });
    }

    // 3. Handle response: stream or full JSON
    if (stream) {
      // For streaming responses, we pipe directly to the client.
      // Note: Real-time credit deduction for streams is more complex and not implemented here.
      // It would require consuming the stream, counting tokens, and then re-streaming.
      res.status(response.status);
      response.body.pipe(res);
    } else {
      // For non-streaming responses, we can process the result and deduct credits.
      const aiResponse = await response.json();

      // --- Task 10.3: Logging and Decrementing (Post-Proxy) ---
      const total_tokens = aiResponse.usage?.total_tokens;

      // Only proceed if we have a token count
      if (total_tokens && total_tokens > 0) {
        const cost = total_tokens; // Cost model: 1 credit = 1 token

        // Note: For production, these two operations should be wrapped in a database transaction
        // to ensure atomicity. If the credit update fails, the usage log should be rolled back.
        try {
          // 1. Log the API usage
          const logQuery = `
            INSERT INTO api_usage_logs (user_id, agent_id, tokens_used, cost)
            VALUES ($1, $2, $3, $4)
          `;
          await db.query(logQuery, [userId, agent_id, total_tokens, cost]);

          // 2. Decrement the user's credits
          const updateQuery = 'UPDATE users SET credits = credits - $1 WHERE "userId" = $2';
          await db.query(updateQuery, [cost, userId]);

        } catch (dbError) {
          // If database operations fail, log the error but still return the AI response to the user.
          // This is a graceful failure mode. The user gets their result, but their credits aren't deducted.
          console.error('Database error during credit deduction:', dbError);
        }
      }

      // Send the final AI response to the client
      res.status(200).json(aiResponse);
    }

  } catch (error) {
    console.error(`Error processing chat request for agent ${agent_slug}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to proxy chat request.' });
    }
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});