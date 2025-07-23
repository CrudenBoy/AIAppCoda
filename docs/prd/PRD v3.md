## **📌 PRD Tasks and Subplans**

---

### **📘 Phase 13: Core Knowledge-Base Ingestion & Privacy**

**Objective:**

Structure, ingest, and secure-filter your app\_content data into DigitalOcean’s GradientAI Knowledge Base, with optional logging for audit/analytics.

---

### **🔧 Task 13.1 – Transform app\_content Rows for KB Ingestion**

**Purpose:**

Canonicalize each lesson/unit into a JSON document that GradientAI can index.

**Outputs:**

A directory ./scripts/tmp/kb/ containing one JSON file per row, e.g. slide\_123.json, with fields:

json

CopyEdit

{

 "user\_id": "...",

 "slide\_id": "...",

 "title": "...",

 "knowledge": "...",

 "learning\_plan\_step": "...",

 "media\_url": "..."

}

**Justification:**

GradientAI KBs ingest JSON “documents” only—this normalizes your SQL rows into the required format.

### **Subtasks**

1. **Schema Inspect**: Review app\_content table schema and identify required columns plus any new LP fields.  
2. **Script Setup**: In your repo’s scripts/ folder, create export-kb-json.js.  
3. **DB Connection**: Use node-postgres to connect via process.env.DATABASE\_URL.  
4. **Query & Map**: SELECT \* FROM app\_content; → map to JS objects with the necessary keys.  
5. **Write Files**: Use fs.writeFileSync to emit each JSON to ./scripts/tmp/kb/slide\_\<slide\_id\>.json.  
6. **CLI Hook**: Add to package.json under "scripts":

json

CopyEdit

"export-kb-json": "node scripts/export-kb-json.js"

### **Glue Code Location**

/scripts/export-kb-json.js in your Git repo.

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “Decompose Task 13.1 into substeps: explain inputs, outputs, dependencies, and data formats needed.”  
* **Implementation Prompt:**  
* “Generate a Node.js script using pg that reads all rows from the app\_content table and writes each as a JSON file under ./scripts/tmp/kb/, including user\_id, slide\_id, title, knowledge, learning\_plan\_step, and media\_url.”

**DO References:**

* App Platform for running this script as a Worker or CLI: [https://docs.digitalocean.com/products/app-platform/](https://docs.digitalocean.com/products/app-platform/) [DigitalOcean Docs](https://docs.digitalocean.com/products/app-platform/?utm_source=chatgpt.com)

---

### **🔧 Task 13.2 – Upload JSON Documents to GradientAI KB via API**

**Purpose:**

Automate ingestion of your JSON docs into a managed GradientAI Knowledge Base, triggering vector embedding and indexing.

**Outputs:**

* Data sources created in your KB (one per JSON).  
* Indexing jobs started for each source.

**Justification:**

Manual uploads don’t scale—glue code ensures repeatable, idempotent ingestion.

### **Subtasks**

1. **Script Setup**: In scripts/upload-kb-json.js.  
2. **Read Files**: Load all \*.json from ./scripts/tmp/kb/.  
3. **API Auth**: Read DO\_API\_TOKEN \+ KB\_ID from env.  
4. **Create Data Source**:

js

CopyEdit

await axios.post(

 \`https://api.digitalocean.com/v2/gen-ai/knowledge\_bases/${KB\_ID}/data\_sources\`,

 { data: fileContent },

 { headers: { Authorization: \`Bearer ${DO\_API\_TOKEN}\` } }

);

1. **Start Indexing Job**:

js

CopyEdit

await axios.post(

 \`https://api.digitalocean.com/v2/gen-ai/knowledge\_bases/${KB\_ID}/data\_sources/${sourceId}/indexing\_jobs\`,

 {},

 { headers: { Authorization: \`Bearer ${DO\_API\_TOKEN}\` } }

);

1. **Batching & Retry**: Handle rate-limits (429), retries with back-off.  
2. **CLI Hook**: Add "upload-kb-json": "node scripts/upload-kb-json.js" to package.json.

### **Glue Code Location**

/scripts/upload-kb-json.js.

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “Break down Task 13.2 into substeps: reading files, authenticating to DO, uploading, handling errors, and confirming indexing.”  
* **Implementation Prompt:**  
* “Generate a Node.js script using axios that reads each JSON in ./scripts/tmp/kb/ and POSTs to the DO GradientAI KB data\_sources endpoint, then triggers indexing jobs, handling 429/5xx errors.”

**DO References:**

* How to Add, Re-index, and Remove Data Sources: [https://docs.digitalocean.com/products/gradientai-platform/how-to/manage-knowledge-base-data-sources/](http://) [DigitalOcean Docs](https://docs.digitalocean.com/products/gradientai-platform/how-to/manage-knowledge-base-data-sources/?utm_source=chatgpt.com)

---

### **🔧 Task 13.3 – Enforce Metadata Filtering on Queries**

**Purpose:**

Ensure that any vector‐search or RAG calls only return documents keyed to the authenticated user—critical for multi-tenant privacy.

**Outputs:**

Updated chat‐proxy endpoint (/api/v1/chat/:agent\_slug) that injects a filter parameter with user\_id.

**Justification:**

GradientAI supports metadata filters out of the box; leverage { filter: { user\_id: "…" } } to isolate each user’s vectors.

### **Subtasks**

1. **Auth Middleware**: Extract user\_id from JWT or session.  
2. **API Call Augment**: In your handler, pass:

js

CopyEdit

agent.query({

 input: prompt,

 filter: { user\_id: context.user\_id }

});

1. **Unit Tests**: Mock two users, confirm cross‐user data never appears.  
2. **README Update**: Document how filtering works and how to add extra tags.

### **Glue Code Location**

Within your backend’s chat-proxy controller, e.g. controllers/chat.js or routes/chat.js.

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “Outline substeps for Task 13.3: securing the chat endpoint, injecting metadata filters, and writing tests.”  
* **Implementation Prompt:**  
* “Write an Express.js middleware that injects filter: { user\_id } into every GradientAI agent query, reading user\_id from the decoded JWT.”

**DO References:**

* GradientAI Platform API reference: [https://docs.digitalocean.com/products/gradientai-platform/reference/](http://) [DigitalOcean Docs](https://docs.digitalocean.com/products/gradientai-platform/reference/?utm_source=chatgpt.com)

---

### **🔧 Task 13.4 – Log All Chat & Ingestion Activity**

**Purpose:**

Capture ingestion and chat events for billing, debugging, and audit.

**Outputs:**

A new table api\_usage\_logs and code hooks to insert log rows on each operation.

| Column | Type | Notes |
| :---- | :---- | :---- |
| id | UUID (PK) |  |
| user\_id | UUID |  |
| action | TEXT | “upload”, “query” |
| slide\_id | UUID | optional for chat |
| kb\_id | UUID | for ingestion |
| tokens\_used | INT | for chat |
| cost\_estimate | NUMERIC | for chat |
| timestamp | TIMESTAMP | default now() |

**Justification:**

Not strictly required for an ultra-lean MVP, but vital once you onboard real users and need to track usage or troubleshoot misbehaving prompts.

### **Subtasks**

1. **DB Migration**: Create migrations/20250723\_create\_api\_usage\_logs.js using your migration tool (e.g. Knex, Sequelize).  
2. **Insert Hooks**: In upload-kb-json.js and chat-proxy, after success/fail, insert into api\_usage\_logs.  
3. **Basic Dashboard (Optional)**: A simple /admin/logs endpoint to view recent entries.  
4. **Tests**: Confirm logs on simulated operations.

### **Glue Code Location**

* migrations/ for schema  
* models/api\_usage\_logs.js or equivalent  
* Hooks in scripts/upload-kb-json.js and controllers/chat.js

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “Decompose Task 13.4: define the schema, write migration, hook into code, and optional dashboard.”  
* **Implementation Prompt:**  
* “Generate a Knex.js migration to create api\_usage\_logs table with the columns above, then code snippets to insert logs after ingestion and chat calls.”

**DO References:**

* Monitoring & Alerts overview (for production‐grade logging): [https://docs.digitalocean.com/products/monitoring-and-alerts/](http://) [DigitalOcean Docs](https://docs.digitalocean.com/products/databases/postgresql/how-to/forward-logs/?utm_source=chatgpt.com)

### **Where Task 13.4’s logs come from those API boundaries,**

. Here’s how it breaks down:

---

### **1\. Ingestion Logs (Uploads)**

Your **upload‐script** (scripts/upload-kb-json.js) is instrumented to write a row into api\_usage\_logs **for every document** it pushes into the GradientAI KB.

js

CopyEdit

// after successful POST to /data\_sources

await db('api\_usage\_logs').insert({

 id: uuid(),

 user\_id: process.env.SYSTEM\_USER\_ID,     // or the system/admin user

 action: 'ingest',

 kb\_id: KB\_ID,

 slide\_id: slideId,

 tokens\_used: null,

 cost\_estimate: null,

 timestamp: new Date()

});

* **When?** Each time you run npm run upload-kb-json.  
* **Where?** In /scripts/upload-kb-json.js immediately after the API call.  
* **Result:** Every JSON doc upload shows up in your logs with action \= 'ingest'.

---

### **2\. Retrieval Logs (Custom GPT Plugin Calls)**

Your Custom GPT is configured with an **OpenAI Plugin** (hosted on DO Functions or App Platform) that routes vector‐search requests to your /api/v1/usc-retriever endpoint. **Every plugin invocation** becomes a log entry:

js

CopyEdit

// in src/routes/retriever.js

router.post('/usc-retriever', authMiddleware, async (req, res) \=\> {

 const { query } \= req.body;

 const { user\_id } \= req.user;

 // Perform the vector search…

 const result \= await gradientai.kb.query({ /\* … \*/ });

 // Log it:

 await db('api\_usage\_logs').insert({

   id: uuid(),

   user\_id,

   action: 'retrieve',

   slide\_id: null,

   kb\_id: KB\_ID,

   tokens\_used: result.tokenCount,          // if SDK returns token usage

   cost\_estimate: result.tokenCount \* RATE, // your rate per 1K tokens

   timestamp: new Date()

 });

 res.json(result.documents);

});

* **When?** Whenever the Custom GPT issues a retrieval tool call (top-K vector query).  
* **Where?** In your **plugin server** or /src/routes/retriever.js on DO.  
* **Result:** ChatGPT’s “Ask your retrieval tool” step is logged by your backend, capturing user, query, tokens, cost.

---

### **3\. (Optional) Chat-Proxy Logs**

If instead your Custom GPT invokes a **function** that proxies entire chat turns through your /api/v1/chat endpoint, you’d similarly log:

js

CopyEdit

// in src/routes/chat.js

await db('api\_usage\_logs').insert({

 id: uuid(),

 user\_id,

 action: 'chat',

 slide\_id: usedSlideId,           // if you injected one

 kb\_id: KB\_ID,

 tokens\_used: apiResponse.usage.total\_tokens,

 cost\_estimate: usageToCost(apiResponse.usage),

 timestamp: new Date()

});

* **When?** On each chat() or completion() call back to your server.  
* **Where?** In your chat‐proxy handler.  
* **Result:** Full-conversation logging, including prompt/response token counts.

---

### **Key Takeaways**

* **Custom GPT UI** lives in ChatGPT; **your APIs** on DO handle data access and logging.  
* **Task 13.4** is populated entirely by your own code **after** each ingestion or retrieval call.  
* If you want to capture **every** turn of the GPT convo (beyond just retrieval), you must route ChatGPT’s function‐calls through your /api/v1/chat proxy—otherwise you only see plugin usage.

---

### **Real-World DO References**

* **GradientAI KB Data Sources API** (for ingestion):  
  [https://docs.digitalocean.com/products/gradientai-platform/how-to/manage-knowledge-base-data-sources/](http://)  
* **GradientAI KB Query API** (for retrieval):  
  [https://docs.digitalocean.com/products/gradientai-platform/reference/knowledge-bases/query/](http://)  
* **DO App Platform Functions** (for hosting your plugin or proxy):  
  [https://docs.digitalocean.com/products/functions/](http://)

With this approach, **every** interaction that touches your data—whether via upload scripts or Custom GPT plugin calls—**automatically populates** your api\_usage\_logs table, fulfilling Task 13.4 in full.

---

## **📌 Phase 14: MVP Personal Learning-Plan System**

**Objective:**

Enable mentors/self-learners to define LPs in Coda, auto-generate personalized content via Gemini, and sync it into your backend so you can run live MVP tests.

*Tasks 14.1 & 14.2 are pure Coda work—covered elsewhere. Below: the DO integration tasks.*

---

### **🔧 Task 14.3 – Push Personalized Rows into app\_content**

**Purpose:**

Extend your Coda Pack → DO backend pipeline to carry new LP fields, enabling bespoke course steps to flow into your SQL.

**Outputs:**

Enhanced /api/app\_content endpoint that upserts rows with columns:

* learning\_outcome  
* media\_url (YouTube, figures)  
* existing fields

**Justification:**

Solid REST contract ensures Coda → DB sync is robust and transactional.

### **Subtasks**

1. **Coda Pack Update**: In pack.ts, extend SendAppContent formula to include extra fields.  
2. **Route Definition**: In routes/appContent.js, add POST /api/app\_content.  
3. **Schema Validation**: Use Zod or Joi to validate incoming JSON.  
4. **DB Upsert**: Within a transaction, INSERT … ON CONFLICT to upsert.  
5. **Response**: Return 201 Created or 200 Updated with row IDs.  
6. **Integration Tests**: Simulate Coda payloads and confirm DB state.

### **Glue Code Location**

* Coda Pack: /coda/pack.ts  
* Backend: /src/routes/appContent.js

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “List substeps for Task 14.3: extending the Coda Pack, implementing validation, and DB upsert logic.”  
* **Implementation Prompt:**  
* “Generate an Express.js POST /api/app\_content endpoint that validates a JSON payload (fields: user\_id, slide\_id, learning\_outcome, media\_url, etc.) and upserts into PostgreSQL within a transaction.”

**DO References:**

* App Platform deployment & routing: [https://docs.digitalocean.com/products/app-platform/](https://docs.digitalocean.com/products/app-platform/) [DigitalOcean Docs](https://docs.digitalocean.com/products/app-platform/how-to/?utm_source=chatgpt.com)

---

### **🔧 Task 14.4 – Embed & Index New Rows for Vector Retrieval**

**Purpose:**

As soon as a personalized row lands in SQL, create its embedding and push to your GradientAI KB so it’s immediately searchable.

**Outputs:**

* OpenAI embeddings generated.  
* Vector documents upserted.

**Justification:**

Ensures real-time RAG experience in your MVP chatbot.

### **Subtasks**

1. **Install Client**: npm install openai @digitalocean/gradientai-sdk.  
2. **Embedding Function**: In utils/embeddings.js, wrap OpenAI.embeddings.create({ input, model }).  
3. **Upsert Vector**: Call DO API /v2/gen-ai/knowledge\_bases/{KB\_ID}/data\_sources/{ds}/indexing\_jobs or SDK method.  
4. **Transactional Hook**: In app\_content upsert handler, after SQL commit, invoke embedding code.  
5. **Error Handling**: Retry logic for 429/502.  
6. **Unit Tests**: Mock OpenAI \+ DO SDK.

### **Glue Code Location**

* /src/utils/embeddings.js  
* Hook in /src/routes/appContent.js

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “Break down Task 14.4 into substeps for embedding text with the OpenAI API and indexing via the DO GradientAI SDK.”  
* **Implementation Prompt:**  
* “Generate a Node.js module that calls openai.embeddings.create on a text string, then uses the DigitalOcean GradientAI SDK to index the vector with metadata: user\_id, slide\_id, LP\_step.”

**DO References:**

* Quickstart: embedding & indexing: [https://docs.digitalocean.com/products/gradientai-platform/getting-started/quickstart/](http://) [DigitalOcean](https://www.digitalocean.com/community/tutorials/getting-started-with-digitalocean-gradientai-platform?utm_source=chatgpt.com)

---

### **🔧 Task 14.5 – Expose Secure Retrieval Endpoint for Custom GPTs**

**Purpose:**

Offer a single, authenticated API that Custom GPTs (or your front-end) can call to get top-k personalized content.

**Outputs:**

POST /api/v1/usc-retriever

Request JSON: { query: string }

Response JSON:

json

CopyEdit

\[

 { "slide\_id": "...", "presentationtext": "...", "media\_url": "..." },

 …

\]

**Justification:**

Abstracts away vector-search details from your Chat UI and Custom GPTs.

### **Subtasks**

1. **Route Setup**: Define in routes/retriever.js.  
2. **Auth Check**: JWT → req.user.id.  
3. **Vector Call**: Use SDK:

js

CopyEdit

await gradientai.kb.query({

 knowledgeBaseUuid: KB\_ID,

 input: query,

 filter: { user\_id },

 topK: 5

});

1. **Format Response**: Map SDK results to your JSON schema.  
2. **Tests**: Confirm only matching docs returned.

### **Glue Code Location**

* /src/routes/retriever.js

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “Outline substeps for Task 14.5: secure endpoint, vector query, response shaping, and tests.”  
* **Implementation Prompt:**  
* “Generate an Express.js POST /api/v1/usc-retriever endpoint that authenticates via JWT, calls the DO GradientAI KB query API with a top-5 vector search filtered by user\_id, and returns slide text \+ media URLs.”

**DO References:**

* API reference for query: [https://docs.digitalocean.com/products/gradientai-platform/reference/](http://) [DigitalOcean Docs](https://docs.digitalocean.com/products/gradientai-platform/reference/?utm_source=chatgpt.com)

---

### **🔧 Task 14.6 – Document Deployment & Testing on DigitalOcean**

**Purpose:**

Hand-off guide so any engineer (or you later) can spin up staging/production: App Platform, Managed Postgres, GradientAI KB, environment vars, and run smoke tests.

**Outputs:**

A **README** section covering:

1. **Service Setup**:  
   * Create App Platform app, link Git repo (branch main) [DigitalOcean Docs](https://docs.digitalocean.com/products/app-platform/how-to/create-apps/?utm_source=chatgpt.com)  
   * Add Worker (for scripts) if desired [DigitalOcean Docs](https://docs.digitalocean.com/products/app-platform/how-to/manage-workers/?utm_source=chatgpt.com)  
2. **Databases**:  
   * Provision Managed PostgreSQL, note DB\_URL [DigitalOcean Docs](https://docs.digitalocean.com/products/databases/postgresql/how-to/connect/?utm_source=chatgpt.com)  
3. **GradientAI**:  
   * Create KB via API or UI, note KB\_ID [DigitalOcean Docs](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm_source=chatgpt.com)  
4. **Env Vars**:

ini

CopyEdit

DIGITALOCEAN\_TOKEN=…

DATABASE\_URL=…

KB\_ID=…

OPENAI\_API\_KEY=…

* **Local Testing**:  
  * npm run export-kb-json && npm run upload-kb-json  
  * curl \-X POST localhost:3000/api/app\_content \-d @testPayload.json  
  * curl \-X POST localhost:3000/api/v1/usc-retriever \-d '{"query":"…"}'

### **UX & LLM Prompts**

* **Planning Prompt:**  
* “List out step-by-step deployment instructions for README: App Platform, DB, GradientAI, env vars, and test commands.”  
* **Implementation Prompt:**  
* “Write a README section titled ‘DigitalOcean Deployment’ that walks through creating the App Platform app, managed DB, GradientAI KB, setting env vars, and running local smoke tests.”

---

### **✅ Confirmation & Next Steps**

* **Task 13.1–13.4** glue code lives in scripts/ and src/routes/ as shown.  
* **Task 14.3–14.6** hooks live in Coda Pack, src/routes, and src/utils/.  
* **Logging (13.4)** is recommended but can be deferred for a hyper-lean MVP—console logs suffice initially.  
* **Custom GPTs (Phase 15\)** need **no content changes** beyond renumbering; all logic here feeds them via /api/v1/usc-retriever.

This level of detail—**purpose**, **outputs**, **justification**, **exact substeps**, **where to store glue code**, **UX/LLM prompts**, and **real DO URLs**—should let any LLM or engineer spin up and manage these phases end to end. Feel free to renumber and slot these into your PRD v3\!

---

### **🔧 Task 15.1 – Build Modular Chatbot UI**

**Description**:

Design a reusable \<GradientChatBot /\> component in the frontend (e.g. React). This component should be able to:

* Float over the presentation UI  
* Accept user\_id, slide\_content, and usage\_type as props  
* Connect securely to your internal API (/api/v1/chat/presentation-bot)

### **📌 How it works:**

* The app collects slide context and user metadata  
* Injects this into a chat session managed by the chatbot component  
* All messages are routed to the backend for processing via a GradientAI Agent

**URL for reference**: *Frontend logic; no GradientAI-specific URL; integrates with Task 13.5’s API logic*

### **✅ Pros:**

* Modular and reusable across other app areas  
* Context-aware interaction per slide  
* Easily toggled and styled for UI consistency

### **❌ Cons:**

* Must ensure clean UX across devices  
* Needs session management and authentication checks

**Justification**:

This structure promotes clean separation between interface and business logic, enabling scale and reuse as your app grows.

**Prompt for Subplan**:

“Create a plan that shows how to build a React chatbot component that can be toggled in a floating panel, accepts slide\_content as context, and communicates with a backend API. Consider supporting documents to understand context based on the PRD document uploaded and Part 1 and Part 2 Project Document.”

**Prompt for accompanying lesson plan**:

“Create a Lesson plan that shows how to build a React chatbot component that can be toggled in a floating panel, accepts slide\_content as context, and communicates with a backend API that is customized for the subplan which will ensure the user has clear understanding based on the URL above. Provide supporting videos where possible as well.”

---

### **🔧 Task 15.2 – Create and Configure GradientAI Agent**

**Description**:

Create a DigitalOcean GradientAI Agent with a defined system prompt tailored to handle presentation slide queries. Enable fallback to a connected Knowledge Base. Configure this via the DigitalOcean UI.

### **📌 How it works:**

* Agent handles prompt routing  
* Uses semantic retrieval (RAG) when no direct answer is found  
* Works in sync with per-user Knowledge Base filters

**URL for reference**: [Create and Manage Agents](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agents/?utm_source=chatgpt.com)

### **✅ Pros:**

* System prompts and agent logic managed centrally  
* Supports fallback to RAG Knowledge Base  
* Works seamlessly with the Agent API

### **❌ Cons:**

* Requires separate setup for each type of assistant logic  
* Slight learning curve for prompt engineering

**Justification**:

Centralized agent management reduces duplication and ensures consistent behavior across interfaces and future modules.

**Prompt for Subplan**:

“Create a detailed walkthrough for configuring a DigitalOcean GradientAI Agent. The agent should use a custom system prompt to answer presentation-based questions and support fallback to a connected Knowledge Base. Use the URL: [https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agents/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agents/?utm_source=chatgpt.com)”

**Prompt for accompanying lesson plan**:

“Create a lesson plan showing how to create and manage a DigitalOcean GradientAI Agent with fallback Knowledge Base support and custom prompt logic. Include use of the DO UI and Agent testing console. Link to the GradientAI documentation where possible.”

---

### **🔧 Task 15.3 – Proxy Chat Queries via Secure Backend**

**Description**:

Extend your backend to include a secure endpoint (e.g., /api/v1/chat/presentation-bot) that accepts user queries from the chatbot UI, appends session and context metadata, and forwards the request to the GradientAI Agent API.

### **📌 How it works:**

* Frontend sends query \+ optional context to backend  
* Backend:  
  * Authenticates with DO API  
  * Injects system prompt and user-specific metadata (user\_id)  
  * Calls GradientAI Agent endpoint  
* Backend returns the response to the UI and logs the interaction

**URL for reference**: [Use Serverless Inference](https://docs.digitalocean.com/products/gradientai-platform/how-to/use-serverless-inference/?utm_source=chatgpt.com)

### **✅ Pros:**

* Central control of query flow and auth  
* Enables logging, auditing, and analytics  
* Allows session enrichment or pre/post-processing of messages

### **❌ Cons:**

* Requires secure API key handling  
* Introduces a small amount of latency vs. direct frontend calls

**Justification**:

Allows you to control security, structure, filtering, and agent logic at a centralized point while enabling app-wide scaling of chatbot capability.

**Prompt for Subplan**:

“Design a backend service (e.g., Node.js or Python FastAPI) that receives chatbot queries from the frontend, injects the current user and slide context, and routes it securely to the GradientAI Agent API. Use this URL as your primary reference: [https://docs.digitalocean.com/products/gradientai-platform/how-to/use-serverless-inference/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/gradientai-platform/how-to/use-serverless-inference/?utm_source=chatgpt.com)”

**Prompt for accompanying lesson plan**:

“Create a lesson plan for building a secure backend API route to proxy chatbot messages to DigitalOcean’s GradientAI Agent API. Ensure the system handles metadata filtering, authentication, and error logging. Use the referenced URL for architecture and examples.”

---

### 

---

### **🔧 Task 15.4 – Log All Chat Usage in App Database**

**Description**:

Update your backend to log each chatbot interaction in a dedicated database table (api\_usage\_logs) capturing:

* user\_id  
* slide\_id or kb\_id  
* prompt, response  
* total\_tokens, model, cost\_estimate  
* timestamp

### **📌 How it works:**

* Backend extracts token usage info from the Agent response  
* Inserts log row in the api\_usage\_logs table  
* Optionally alerts or reports high usage events

**URL for reference**: [App Platform Logs](https://docs.digitalocean.com/products/app-platform/how-to/view-logs/?utm_source=chatgpt.com)

### **✅ Pros:**

* Provides full traceability of chat usage  
* Enables analytics and user-specific billing  
* Helps debug or improve system prompts

### **❌ Cons:**

* Adds write overhead to each request  
* Requires schema and table maintenance

**Justification**:

Logging is crucial for cost control, billing insights, future debugging, and monitoring user engagement. It also prepares your app for growth and SaaS-style transparency.

**Prompt for Subplan**:

“Extend your app database schema to log chatbot interactions. Capture user\_id, tokens used, prompt, response, and timestamps. Reference this logging guide from DO for monitoring: [https://docs.digitalocean.com/products/app-platform/how-to/view-logs/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/app-platform/how-to/view-logs/?utm_source=chatgpt.com)”

**Prompt for accompanying lesson plan**:

“Create a backend-focused lesson that walks through adding a usage logging system for GradientAI chatbot queries. Include schema design, logging code, and how to analyze trends over time.”

---

## **📌 PRD Tasks and Subplans — Phase 16: STT and TTS Integration (Updated)**

---

### **🔧 Task 16.1 – Evaluate STT Provider**

**Description:**

Evaluate and select a Speech-to-Text (STT) provider for converting user audio into text input for the chatbot. Based on your selection, this project will begin with the **OpenAI Whisper API** due to its speed of integration, robust quality, and managed nature.

### **📌 How it works:**

* Test Whisper API using sample audio data across different accents and speaking styles  
* Benchmark transcription latency and text accuracy  
* Confirm backend integration points for securely handling recorded audio uploads from the browser

**Expanded Justification (Verbatim \+ Contextual)**:

You selected OpenAI Whisper API as your starting STT solution because:

* **It is managed and API-based**, so there’s **no infrastructure to host or scale** on DigitalOcean yet.  
* It is **cost-effective at low to moderate usage**: pay-per-minute pricing makes it viable during MVP and prototyping.  
* Whisper offers **multi-language support**, high accuracy even in noisy environments, and can be upgraded later to a self-hosted model on DO if cost becomes an issue.  
* You want a **quick and proven path** to STT while building out the chatbot and UI workflows.

You may replace Whisper with Deepgram or a custom DO-hosted Whisper container in future phases, especially if real-time streaming or regulatory data residency becomes a priority.

**🔗 URL for source of truth:**

[Real-Time Audio Translation using OpenAI Whisper on DO](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm_source=chatgpt.com)

### **✅ Pros:**

* High transcription quality out-of-the-box  
* Simple HTTP API – ideal for fast MVP testing  
* Easily replaceable with a local model in later phases

### **❌ Cons:**

* Cost scales with usage; not ideal for always-on live streaming  
* Whisper can be slower than real-time for long-form audio

**Prompt for Subplan:**

*“Create a subplan to test OpenAI Whisper API for STT. Use the tutorial at* [https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui). Define test cases (clear speech, noisy audio), record transcription accuracy benchmarks, and analyze latency. Include a comparison with self-hosted options and prepare recommendations for Phase 15.”

**Prompt for lesson plan:**

*“Create a lesson plan that teaches how to use the OpenAI Whisper API for real-time STT transcription. Base the approach on the DO tutorial linked above. Include browser recording code, backend API routing, audio formatting, error handling, and best practices for secure STT processing.”*

---

### **🔧 Task 16.2 – Implement STT Integration**

**Description:**

Integrate OpenAI Whisper API into the app’s frontend and backend. Users will press a mic icon to speak, the browser records audio, and the backend transcribes it to text for chatbot processing.

### **📌 How it works:**

* Frontend uses MediaRecorder to capture .webm audio  
* Sends audio via POST to /api/v1/stt  
* Backend uploads audio to Whisper API and returns transcription  
* The chatbot then handles the transcribed prompt as a standard query

**Expanded Justification (Verbatim \+ Contextual)**:

You chose to integrate STT early in the chatbot because:

* It adds **accessibility and natural UX**, letting users talk instead of type.  
* It **prepares the platform for future multimodal input** such as voice search, voice navigation, and spoken presentation control.  
* This also creates a **reusable voice capture system** across other modules (e.g., itinerary planner, document search).  
* Starting with a **centralized STT flow in the backend** makes it easier to monitor and manage user queries securely and consistently.

The decision supports your broader architecture where voice will be a modular capability triggered contextually (e.g., during a presentation).

**🔗 URL for source of truth:**

[Whisper Audio Integration Tutorial](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm_source=chatgpt.com)

### **✅ Pros:**

* Enables voice interaction in chatbot MVP  
* Works across devices using browser-native APIs  
* Backend approach ensures centralized monitoring and STT fallback handling

### **❌ Cons:**

* Browser audio APIs can behave differently across platforms  
* Latency depends on network and API response time

**Prompt for Subplan:**

*“Build a subplan to implement STT in the chatbot flow using OpenAI Whisper. The user should be able to record audio in the browser (MediaRecorder), POST to a backend /api/v1/stt, which uploads to Whisper and returns the transcription. Use* [https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui) as the implementation reference.”

**Prompt for lesson plan:**

*“Develop a lesson plan that teaches developers how to add STT capability using OpenAI Whisper and MediaRecorder. Base it on the DigitalOcean Whisper tutorial. Include frontend mic capture code, backend transcription proxy, and chatbot integration examples. Emphasize security and metadata tagging.”*

### **🔧 Task 16.3 – Evaluate TTS Provider**

**Description:**

Select the best Text-to-Speech (TTS) provider. We’ll begin with the **OpenAI TTS API**, due to its simplicity, natural voice quality, and seamless integration with Whisper/TTS workflows.

### **📌 How it works:**

* Send text strings to the OpenAI TTS API  
* Receive audio responses in formats like .mp3 or .wav  
* Test latency, voice clarity, and pronunciation quality across sample responses

**Expanded Justification (Verbatim \+ Contextual):**

“Start with OpenAI TTS API for natural voice output — it’s simple to integrate, offers high-quality synthesis, and lets us prototype quickly. Later, if refining voice styles or reducing cost is a priority, we can migrate to ElevenLabs or a self-hosted TTS solution based on Phase 15 evaluations.”

**🔗 URL for reference:**

[Best TTS Models Overview](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com)

### **✅ Pros:**

* Natural-sounding voice output  
* Quick integration via API  
* Consistent quality across playback devices

### **❌ Cons:**

* Usage-based costs and latency  
* Needs fallback (e.g., browser speech synthesis) if API fails

**Prompt for Subplan:**

*“Create a comparative analysis plan for TTS using the DigitalOcean tutorial at* [https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm\_source=chatgpt.com](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com). Include voice quality tests, latency benchmarks, and cost-per-minute estimates for OpenAI TTS output. Provide recommendations for fallback or upgrade paths.”

**Prompt for lesson plan:**

*“Write a lesson plan for integrating OpenAI TTS API into a chatbot. Include code to send text to the API, receive audio, play it in the browser, and handle errors or offline fallbacks. Base this on the DO article linked above.”*

---

### **🔧 Task 16.4 – Implement TTS in Frontend \+ Backend**

**Description:**

Implement TTS functionality within the chatbot pipeline. After generating a text response via GradientAI Agent, route it through the TTS provider and return audio to the frontend for playback.

### **📌 How it works:**

* Chatbot sends text to /api/v1/tts-generate  
* Backend calls OpenAI TTS API with the text  
* Receives audio blob and sends it to frontend  
* Frontend uses \<audio\> or Web Audio API to play the response

**Expanded Justification (Verbatim \+ Contextual):**

“Implement OpenAI TTS for initial voice interaction due to its seamless integration and natural output. The audio blob method ensures low frontend complexity. Future improvements can include ElevenLabs or self-hosted models as needed.”

**🔗 URL for reference:**

[Best TTS Models Overview](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com)

### **✅ Pros:**

* Completes the voice interaction loop  
* Delivers polished, accessible UI experience  
* Suitable for both desktop and mobile

### **❌ Cons:**

* Audio generation adds latency per response  
* Must manage streaming or buffering for longer text

**Prompt for Subplan:**

*“Generate a step-by-step guide to implement TTS in a chatbot: take the assistant text response, call OpenAI’s TTS API, return audio blob to the frontend, and play back using Web Audio. Use the DigitalOcean TTS models article as source.”*

**Prompt for lesson plan:**

*“Create a lesson plan teaching developers how to integrate TTS with chatbot responses. Include backend API logic, audio streaming handling, and fallback options. Reference the DO tutorial on best TTS models.”*

---

### **🔧 Task 16.5 – Integrate Voice into Chatbot Flow**

**Description:**

Combine STT and TTS into a cohesive voice-driven chatbot experience. This includes UI state management, conversation flow control, and error handling for real-time interactions.

### **📌 How it works:**

1. User clicks mic icon → frontend starts recording  
2. Upon stop, audio is sent to /api/v1/stt → transcription returned  
3. Chat query sent to chatbot backend → agent processes response  
4. Agent text response is sent to /api/v1/tts-generate → audio returned  
5. Frontend plays audio and displays text visually  
6. UI handles fallback states and simultaneous usage

**Expanded Justification (Verbatim \+ Contextual):**

“Integrate voice smoothly — from recording, to transcription, to agent response, to speech output — to create a natural, conversational user flow within the app. This is required for inclusive, hands-free interaction during presentations.”

**🔗 URLs for reference:**

* Whisper STT Integration: [https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm\_source=chatgpt.com](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm_source=chatgpt.com)  
* TTS Models Overview: [https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm\_source=chatgpt.com](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com)

### **✅ Pros:**

* Enables full voice-interactive conversations  
* Accessible and intuitive experience  
* UI benefits from fallback logic for interruptions or failure states

### **❌ Cons:**

* Complex UI state transitions  
* Requires careful UX design and mobile testing

**Prompt for Subplan:**

*“Design a comprehensive integration plan for voice-enabled chat flow: link mic capture, STT via Whisper, chat agent processing, TTS generation, and audio playback. Include UI state transitions and failure scenarios. Use the DO STT and TTS tutorial links as source references.”*

**Prompt for lesson plan:**

*“Create a lesson plan that guides developers through building a full voice chat experience: from mic interaction to playback, with state control, fallbacks, and UX best practices. Fontend and backend code scaffolding should be included.”*

## **📘 Phase 17: Scaling, Personalization & System Monitoring**

### **🎯 Primary Objective:**

Transition the voice-enabled chatbot from a functional MVP to a scalable, secure, and user-personalized SaaS-ready platform.

---

## **📌 PRD Task Outline**

### **🔧 Task 17.1 – Personalize AI Responses Using User Metadata**

* Inject user\_profile, previous\_queries, or content\_preferences into prompts  
* Tailor responses by geography, content history, or user role  
* Extend backend to fetch user-specific context at query time

### **🔧 Task 17.2 – Enhance Security & Role-Based Access**

* Implement API-level user validation using JWT or OAuth  
* Add RBAC logic to differentiate between roles (e.g., admin, presenter, guest)  
* Filter KB or RAG queries based on user roles

### **🔧 Task 17.3 – Improve Analytics and Usage Dashboards**

* Build dashboards showing:  
  * STT/TTS usage  
  * Agent response times  
  * User feedback on quality  
* Log metadata for advanced filtering (e.g., slide\_id, query\_topic)

### **🔧 Task 17.4 – Add Notification System for Usage or Failures**

* Trigger alerts on:  
  * High API usage  
  * Failures in TTS/STT pipelines  
  * Unexpected agent behavior  
* Integrate with Slack, email, or internal logs

### **🔧 Task 17.5 – Prepare Billing Logic (Optional)**

* Track usage by tokens/minutes for each feature  
* Calculate monthly cost per user  
* Generate invoices or billing summaries

---

## **🔮 Future Prep Suggestions (Optional Phase 16 Onward)**

* Add multilingual support via Whisper \+ OpenAI Translator  
* Plug in real-time collaboration (co-browsing, shared chat)  
* Create exportable chat summaries for PDF or slideshow formats

