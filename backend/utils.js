const fs = require('fs/promises');
const { join } = require('path');
require("dotenv").config(); // Ensure env vars are loaded

const DOC_REGISTRY_PATH = join(__dirname, 'doc_registry.json');
const ACTIVITY_LOGS_PATH = join(__dirname, 'activity_logs.json');

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found, return empty array for registry/logs
      return [];
    }
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw error; // Re-throw for handling by caller
  }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw error; // Re-throw for handling by caller
  }
}

// Helper function to log activity
async function logActivity(docId, regKey, endpoint, statusCode, message, requestDetails = {}) {
  try {
    const logs = await readJsonFile(ACTIVITY_LOGS_PATH);
    const newLog = {
      timestamp: new Date().toISOString(),
      docId: docId || 'N/A',
      regKey: regKey || 'N/A',
      endpoint,
      status: statusCode,
      message,
      requestDetails, // e.g., IP, user-agent, truncated payload
      traceId: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` // Basic trace ID
    };
    logs.push(newLog);
    await writeJsonFile(ACTIVITY_LOGS_PATH, logs);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// --- Middleware for Push Authorization ---
async function authorizePush(req, res, next) {
  const regKey = req.headers.authorization?.split(' ')[1]; // Bearer [regKey]
  const docId = req.headers['x-doc-id'];

  if (!regKey || !docId) {
    await logActivity(docId, regKey, req.path, 401, 'Missing docId or regKey in headers');
    return res.status(401).json({ message: 'Unauthorized: Missing docId or registration key.' });
  }

  try {
    const registry = await readJsonFile(DOC_REGISTRY_PATH);
    const doc = registry.find(d => d.docId === docId && d.regKey === regKey);

    if (!doc) {
      await logActivity(docId, regKey, req.path, 401, 'Document not found or regKey mismatch');
      return res.status(401).json({ message: 'Unauthorized: Document not registered or key invalid.' });
    }

    if (doc.status !== 'active') {
      await logActivity(docId, regKey, req.path, 401, `Document status is ${doc.status}`);
      return res.status(401).json({ message: `Unauthorized: Document status is '${doc.status}'.` });
    }

    // Optional: Check expiration
    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
      await logActivity(docId, regKey, req.path, 401, 'Registration key expired');
      return res.status(401).json({ message: 'Unauthorized: Registration key has expired.' });
    }

    req.docDetails = doc; // Attach doc details to request object for use in route handlers
    next();
  } catch (error) {
    console.error('Authorization middleware error:', error);
    await logActivity(docId, regKey, req.path, 500, 'Internal server error during authorization');
    return res.status(500).json({ message: 'Internal Server Error during authorization.' });
  }
}

module.exports = {
  DOC_REGISTRY_PATH,
  ACTIVITY_LOGS_PATH,
  readJsonFile,
  writeJsonFile,
  logActivity,
  authorizePush,
};