## 📌 PRD Tasks and Subplans

---

### 🔧 **Task 13.1 – Build Modular Chatbot UI**

**Description**:
Design a reusable `<GradientChatBot />` component in the frontend (e.g. React). This component should be able to:

* Float over the presentation UI
* Accept `user_id`, `slide_content`, and `usage_type` as props
* Connect securely to your internal API (`/api/v1/chat/presentation-bot`)

### 📌 How it works:

* The app collects slide context and user metadata
* Injects this into a chat session managed by the chatbot component
* All messages are routed to the backend for processing via a GradientAI Agent

**URL for reference**: *Frontend logic; no GradientAI-specific URL; integrates with Task 13.5's API logic*

### ✅ Pros:

* Modular and reusable across other app areas
* Context-aware interaction per slide
* Easily toggled and styled for UI consistency

### ❌ Cons:

* Must ensure clean UX across devices
* Needs session management and authentication checks

**Justification**:
This structure promotes clean separation between interface and business logic, enabling scale and reuse as your app grows.

**Prompt for Subplan**:

> "Create a plan that shows how to build a React chatbot component that can be toggled in a floating panel, accepts `slide_content` as context, and communicates with a backend API. Consider supporting documents to understand context based on the PRD document uploaded and Part 1 and Part 2 Project Document."

**Prompt for accompanying lesson plan**:

> "Create a Lesson plan that shows how to build a React chatbot component that can be toggled in a floating panel, accepts `slide_content` as context, and communicates with a backend API that is customized for the subplan which will ensure the user has clear understanding based on the URL above. Provide supporting videos where possible as well."

---

### 🔧 **Task 13.2 – Create and Configure GradientAI Agent**

**Description**:
Create a DigitalOcean GradientAI Agent with a defined system prompt tailored to handle presentation slide queries. Enable fallback to a connected Knowledge Base. Configure this via the DigitalOcean UI.

### 📌 How it works:

* Agent handles prompt routing
* Uses semantic retrieval (RAG) when no direct answer is found
* Works in sync with per-user Knowledge Base filters

**URL for reference**: [Create and Manage Agents](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agents/?utm_source=chatgpt.com)

### ✅ Pros:

* System prompts and agent logic managed centrally
* Supports fallback to RAG Knowledge Base
* Works seamlessly with the Agent API

### ❌ Cons:

* Requires separate setup for each type of assistant logic
* Slight learning curve for prompt engineering

**Justification**:
Centralized agent management reduces duplication and ensures consistent behavior across interfaces and future modules.

**Prompt for Subplan**:

> "Create a detailed walkthrough for configuring a DigitalOcean GradientAI Agent. The agent should use a custom system prompt to answer presentation-based questions and support fallback to a connected Knowledge Base. Use the URL: [https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agents/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agents/?utm_source=chatgpt.com)"

**Prompt for accompanying lesson plan**:

> "Create a lesson plan showing how to create and manage a DigitalOcean GradientAI Agent with fallback Knowledge Base support and custom prompt logic. Include use of the DO UI and Agent testing console. Link to the GradientAI documentation where possible."

---

### 🔧 **Task 13.3 – Transform `app_content` Rows for Knowledge Base Ingestion**

**Description**:
Write a backend process that extracts rows from the `app_content` table and formats each one as a `.json` document. Include metadata fields such as `user_id`, `slide_id`, and `title`.

### 📌 How it works:

* Query all slides from `app_content`
* Convert each row into a file using structured JSON
* Prepare for upload into GradientAI Knowledge Base

**URL for reference**: [Create and Manage Knowledge Bases](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm_source=chatgpt.com)

### ✅ Pros:

* Clean, well-structured data pipeline
* Metadata tagging supports filtering and future features
* Allows version control of KB content

### ❌ Cons:

* Adds a backend maintenance task
* Must validate structure against DO’s API requirements

**Justification**:
Prepares the content in a format that ensures secure, scalable ingestion and usage in GradientAI’s vector store and search system.

**Prompt for Subplan**:

> "Write a backend utility that transforms rows from the `app_content` table into `.json` files for upload to GradientAI. Each file should include `user_id`, `slide_id`, and `title`. Follow the structure described here: [https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm_source=chatgpt.com)"

**Prompt for accompanying lesson plan**:

> "Create a lesson plan that teaches how to extract rows from a SQL table and format them as `.json` files with metadata for use in DigitalOcean GradientAI’s KB ingestion. Provide walkthroughs and CLI usage examples where possible."

---

### 🔧 **Task 13.4 – Upload Documents to GradientAI KB via API**

**Description**:
Create a secure backend service to upload the JSON files created in Task 13.3 to your GradientAI Knowledge Base. This should use authenticated API calls and include metadata for secure filtering (e.g., `user_id`).

### 📌 How it works:

* Backend authenticates with DO using API tokens
* Sends POST requests to the KB ingestion endpoint
* Monitors response for success or errors

**URL for reference**: [Upload via API](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm_source=chatgpt.com)

### ✅ Pros:

* Real-time updates possible
* Granular control over document uploads
* Supports all future modules and automation

### ❌ Cons:

* Requires secure key management
* Slight complexity in request formatting and batching

**Justification**:
This method ensures the system is both secure and programmatically controlled, reducing reliance on manual uploads or third-party tools.

**Prompt for Subplan**:

> "Create a backend service that authenticates with DigitalOcean’s GradientAI API and uploads `.json` files with metadata into a Knowledge Base. Follow this guide: [https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm_source=chatgpt.com)"

**Prompt for accompanying lesson plan**:

> "Develop a lesson plan showing how to build a backend service that uploads content to a DigitalOcean GradientAI KB via API, includes authentication and error handling, and integrates with an app database."

---

### 🔧 **Task 13.5 – Proxy Chat Queries via Secure Backend**

**Description**:
Extend your backend to include a secure endpoint (e.g., `/api/v1/chat/presentation-bot`) that accepts user queries from the chatbot UI, appends session and context metadata, and forwards the request to the GradientAI Agent API.

### 📌 How it works:

* Frontend sends query + optional context to backend
* Backend:

  * Authenticates with DO API
  * Injects system prompt and user-specific metadata (`user_id`)
  * Calls GradientAI Agent endpoint
* Backend returns the response to the UI and logs the interaction

**URL for reference**: [Use Serverless Inference](https://docs.digitalocean.com/products/gradientai-platform/how-to/use-serverless-inference/?utm_source=chatgpt.com)

### ✅ Pros:

* Central control of query flow and auth
* Enables logging, auditing, and analytics
* Allows session enrichment or pre/post-processing of messages

### ❌ Cons:

* Requires secure API key handling
* Introduces a small amount of latency vs. direct frontend calls

**Justification**:
Allows you to control security, structure, filtering, and agent logic at a centralized point while enabling app-wide scaling of chatbot capability.

**Prompt for Subplan**:

> "Design a backend service (e.g., Node.js or Python FastAPI) that receives chatbot queries from the frontend, injects the current user and slide context, and routes it securely to the GradientAI Agent API. Use this URL as your primary reference: [https://docs.digitalocean.com/products/gradientai-platform/how-to/use-serverless-inference/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/gradientai-platform/how-to/use-serverless-inference/?utm_source=chatgpt.com)"

**Prompt for accompanying lesson plan**:

> "Create a lesson plan for building a secure backend API route to proxy chatbot messages to DigitalOcean's GradientAI Agent API. Ensure the system handles metadata filtering, authentication, and error logging. Use the referenced URL for architecture and examples."

---

### 🔧 **Task 13.6 – Enforce Metadata-Based Filtering in Agent Queries**

**Description**:
Ensure all queries sent to GradientAI Agent include metadata filters such as `user_id` (and optionally `slide_id`) to isolate responses to the correct user.

### 📌 How it works:

* When uploading KB documents, include `user_id`
* When querying via API, pass:

```json
{
  "filters": {
    "user_id": "abc123"
  }
}
```

**URL for reference**: [Filtering with Metadata](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm_source=chatgpt.com)

### ✅ Pros:

* Simple and effective for user data separation
* No need for custom ACL systems
* Scales to teams, roles, or workspaces in the future

### ❌ Cons:

* Requires disciplined metadata tagging at upload
* Developer must remember to enforce the filters per query

**Justification**:
A scalable, lightweight way to enforce user data access in KB queries — ideal for SaaS platforms like yours that plan to support many users.

**Prompt for Subplan**:

> "Create a middleware function that ensures all outgoing Agent queries to the GradientAI API include a `user_id` filter. Base this on how metadata filtering works in DigitalOcean’s KB documentation: [https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/?utm_source=chatgpt.com)"

**Prompt for accompanying lesson plan**:

> "Build a lesson plan that explains how to secure KB access in a multi-user chatbot by attaching metadata filters (`user_id`) to every query. Teach how to enforce it on the server-side and why it matters."

---

### 🔧 **Task 13.7 – Log All Chat Usage in App Database**

**Description**:
Update your backend to log each chatbot interaction in a dedicated database table (`api_usage_logs`) capturing:

* `user_id`
* `slide_id` or `kb_id`
* `prompt`, `response`
* `total_tokens`, `model`, `cost_estimate`
* `timestamp`

### 📌 How it works:

* Backend extracts token usage info from the Agent response
* Inserts log row in the `api_usage_logs` table
* Optionally alerts or reports high usage events

**URL for reference**: [App Platform Logs](https://docs.digitalocean.com/products/app-platform/how-to/view-logs/?utm_source=chatgpt.com)

### ✅ Pros:

* Provides full traceability of chat usage
* Enables analytics and user-specific billing
* Helps debug or improve system prompts

### ❌ Cons:

* Adds write overhead to each request
* Requires schema and table maintenance

**Justification**:
Logging is crucial for cost control, billing insights, future debugging, and monitoring user engagement. It also prepares your app for growth and SaaS-style transparency.

**Prompt for Subplan**:

> "Extend your app database schema to log chatbot interactions. Capture `user_id`, tokens used, prompt, response, and timestamps. Reference this logging guide from DO for monitoring: [https://docs.digitalocean.com/products/app-platform/how-to/view-logs/?utm\_source=chatgpt.com](https://docs.digitalocean.com/products/app-platform/how-to/view-logs/?utm_source=chatgpt.com)"

**Prompt for accompanying lesson plan**:

> "Create a backend-focused lesson that walks through adding a usage logging system for GradientAI chatbot queries. Include schema design, logging code, and how to analyze trends over time."

---


## 📌 PRD Tasks and Subplans — Phase 14: STT and TTS Integration (Updated)

---

### 🔧 **Task 14.1 – Evaluate STT Provider**

**Description:**
Evaluate and select a Speech-to-Text (STT) provider for converting user audio into text input for the chatbot. Based on your selection, this project will begin with the **OpenAI Whisper API** due to its speed of integration, robust quality, and managed nature.

### 📌 How it works:

* Test Whisper API using sample audio data across different accents and speaking styles
* Benchmark transcription latency and text accuracy
* Confirm backend integration points for securely handling recorded audio uploads from the browser

**Expanded Justification (Verbatim + Contextual)**:
You selected OpenAI Whisper API as your starting STT solution because:

* **It is managed and API-based**, so there's **no infrastructure to host or scale** on DigitalOcean yet.
* It is **cost-effective at low to moderate usage**: pay-per-minute pricing makes it viable during MVP and prototyping.
* Whisper offers **multi-language support**, high accuracy even in noisy environments, and can be upgraded later to a self-hosted model on DO if cost becomes an issue.
* You want a **quick and proven path** to STT while building out the chatbot and UI workflows.

You may replace Whisper with Deepgram or a custom DO-hosted Whisper container in future phases, especially if real-time streaming or regulatory data residency becomes a priority.

**🔗 URL for source of truth:**
[Real-Time Audio Translation using OpenAI Whisper on DO](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm_source=chatgpt.com)

### ✅ Pros:

* High transcription quality out-of-the-box
* Simple HTTP API – ideal for fast MVP testing
* Easily replaceable with a local model in later phases

### ❌ Cons:

* Cost scales with usage; not ideal for always-on live streaming
* Whisper can be slower than real-time for long-form audio

**Prompt for Subplan:**

> *“Create a subplan to test OpenAI Whisper API for STT. Use the tutorial at [https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui). Define test cases (clear speech, noisy audio), record transcription accuracy benchmarks, and analyze latency. Include a comparison with self-hosted options and prepare recommendations for Phase 15.”*

**Prompt for lesson plan:**

> *“Create a lesson plan that teaches how to use the OpenAI Whisper API for real-time STT transcription. Base the approach on the DO tutorial linked above. Include browser recording code, backend API routing, audio formatting, error handling, and best practices for secure STT processing.”*

---

### 🔧 **Task 14.2 – Implement STT Integration**

**Description:**
Integrate OpenAI Whisper API into the app’s frontend and backend. Users will press a mic icon to speak, the browser records audio, and the backend transcribes it to text for chatbot processing.

### 📌 How it works:

* Frontend uses `MediaRecorder` to capture `.webm` audio
* Sends audio via POST to `/api/v1/stt`
* Backend uploads audio to Whisper API and returns transcription
* The chatbot then handles the transcribed prompt as a standard query

**Expanded Justification (Verbatim + Contextual)**:
You chose to integrate STT early in the chatbot because:

* It adds **accessibility and natural UX**, letting users talk instead of type.
* It **prepares the platform for future multimodal input** such as voice search, voice navigation, and spoken presentation control.
* This also creates a **reusable voice capture system** across other modules (e.g., itinerary planner, document search).
* Starting with a **centralized STT flow in the backend** makes it easier to monitor and manage user queries securely and consistently.

The decision supports your broader architecture where voice will be a modular capability triggered contextually (e.g., during a presentation).

**🔗 URL for source of truth:**
[Whisper Audio Integration Tutorial](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm_source=chatgpt.com)

### ✅ Pros:

* Enables voice interaction in chatbot MVP
* Works across devices using browser-native APIs
* Backend approach ensures centralized monitoring and STT fallback handling

### ❌ Cons:

* Browser audio APIs can behave differently across platforms
* Latency depends on network and API response time

**Prompt for Subplan:**

> *“Build a subplan to implement STT in the chatbot flow using OpenAI Whisper. The user should be able to record audio in the browser (MediaRecorder), POST to a backend `/api/v1/stt`, which uploads to Whisper and returns the transcription. Use [https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui) as the implementation reference.”*

**Prompt for lesson plan:**

> *“Develop a lesson plan that teaches developers how to add STT capability using OpenAI Whisper and MediaRecorder. Base it on the DigitalOcean Whisper tutorial. Include frontend mic capture code, backend transcription proxy, and chatbot integration examples. Emphasize security and metadata tagging.”*




### 🔧 **Task 14.3 – Evaluate TTS Provider**

**Description:**
Select the best Text-to-Speech (TTS) provider. We’ll begin with the **OpenAI TTS API**, due to its simplicity, natural voice quality, and seamless integration with Whisper/TTS workflows.

### 📌 How it works:

* Send text strings to the OpenAI TTS API
* Receive audio responses in formats like `.mp3` or `.wav`
* Test latency, voice clarity, and pronunciation quality across sample responses

**Expanded Justification (Verbatim + Contextual):**

> “Start with OpenAI TTS API for natural voice output — it’s simple to integrate, offers high-quality synthesis, and lets us prototype quickly. Later, if refining voice styles or reducing cost is a priority, we can migrate to ElevenLabs or a self-hosted TTS solution based on Phase 15 evaluations.”

**🔗 URL for reference:**
[Best TTS Models Overview](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com)

### ✅ Pros:

* Natural-sounding voice output
* Quick integration via API
* Consistent quality across playback devices

### ❌ Cons:

* Usage-based costs and latency
* Needs fallback (e.g., browser speech synthesis) if API fails

**Prompt for Subplan:**

> *“Create a comparative analysis plan for TTS using the DigitalOcean tutorial at [https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm\_source=chatgpt.com](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com). Include voice quality tests, latency benchmarks, and cost-per-minute estimates for OpenAI TTS output. Provide recommendations for fallback or upgrade paths.”*

**Prompt for lesson plan:**

> *“Write a lesson plan for integrating OpenAI TTS API into a chatbot. Include code to send text to the API, receive audio, play it in the browser, and handle errors or offline fallbacks. Base this on the DO article linked above.”*

---

### 🔧 **Task 14.4 – Implement TTS in Frontend + Backend**

**Description:**
Implement TTS functionality within the chatbot pipeline. After generating a text response via GradientAI Agent, route it through the TTS provider and return audio to the frontend for playback.

### 📌 How it works:

* Chatbot sends text to `/api/v1/tts-generate`
* Backend calls OpenAI TTS API with the text
* Receives audio blob and sends it to frontend
* Frontend uses `<audio>` or Web Audio API to play the response

**Expanded Justification (Verbatim + Contextual):**

> “Implement OpenAI TTS for initial voice interaction due to its seamless integration and natural output. The audio blob method ensures low frontend complexity. Future improvements can include ElevenLabs or self-hosted models as needed.”

**🔗 URL for reference:**
[Best TTS Models Overview](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com)

### ✅ Pros:

* Completes the voice interaction loop
* Delivers polished, accessible UI experience
* Suitable for both desktop and mobile

### ❌ Cons:

* Audio generation adds latency per response
* Must manage streaming or buffering for longer text

**Prompt for Subplan:**

> *“Generate a step-by-step guide to implement TTS in a chatbot: take the assistant text response, call OpenAI’s TTS API, return audio blob to the frontend, and play back using Web Audio. Use the DigitalOcean TTS models article as source.”*

**Prompt for lesson plan:**

> *“Create a lesson plan teaching developers how to integrate TTS with chatbot responses. Include backend API logic, audio streaming handling, and fallback options. Reference the DO tutorial on best TTS models.”*

---

### 🔧 **Task 14.5 – Integrate Voice into Chatbot Flow**

**Description:**
Combine STT and TTS into a cohesive voice-driven chatbot experience. This includes UI state management, conversation flow control, and error handling for real-time interactions.

### 📌 How it works:

1. User clicks mic icon → frontend starts recording
2. Upon stop, audio is sent to `/api/v1/stt` → transcription returned
3. Chat query sent to chatbot backend → agent processes response
4. Agent text response is sent to `/api/v1/tts-generate` → audio returned
5. Frontend plays audio and displays text visually
6. UI handles fallback states and simultaneous usage

**Expanded Justification (Verbatim + Contextual):**

> “Integrate voice smoothly — from recording, to transcription, to agent response, to speech output — to create a natural, conversational user flow within the app. This is required for inclusive, hands-free interaction during presentations.”

**🔗 URLs for reference:**

* Whisper STT Integration: [https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm\_source=chatgpt.com](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui?utm_source=chatgpt.com)
* TTS Models Overview: [https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm\_source=chatgpt.com](https://www.digitalocean.com/community/tutorials/best-text-to-speech-models?utm_source=chatgpt.com)

### ✅ Pros:

* Enables full voice-interactive conversations
* Accessible and intuitive experience
* UI benefits from fallback logic for interruptions or failure states

### ❌ Cons:

* Complex UI state transitions
* Requires careful UX design and mobile testing

**Prompt for Subplan:**

> *“Design a comprehensive integration plan for voice-enabled chat flow: link mic capture, STT via Whisper, chat agent processing, TTS generation, and audio playback. Include UI state transitions and failure scenarios. Use the DO STT and TTS tutorial links as source references.”*

**Prompt for lesson plan:**

> *“Create a lesson plan that guides developers through building a full voice chat experience: from mic interaction to playback, with state control, fallbacks, and UX best practices. Fontend and backend code scaffolding should be included.”*

## 📘 **Phase 15: Scaling, Personalization & System Monitoring**

### 🎯 **Primary Objective:**

Transition the voice-enabled chatbot from a functional MVP to a scalable, secure, and user-personalized SaaS-ready platform.

---

## 📌 PRD Task Outline

### 🔧 **Task 15.1 – Personalize AI Responses Using User Metadata**

* Inject `user_profile`, `previous_queries`, or `content_preferences` into prompts
* Tailor responses by geography, content history, or user role
* Extend backend to fetch user-specific context at query time

### 🔧 **Task 15.2 – Enhance Security & Role-Based Access**

* Implement API-level user validation using JWT or OAuth
* Add RBAC logic to differentiate between roles (e.g., admin, presenter, guest)
* Filter KB or RAG queries based on user roles

### 🔧 **Task 15.3 – Improve Analytics and Usage Dashboards**

* Build dashboards showing:

  * STT/TTS usage
  * Agent response times
  * User feedback on quality
* Log metadata for advanced filtering (e.g., `slide_id`, `query_topic`)

### 🔧 **Task 15.4 – Add Notification System for Usage or Failures**

* Trigger alerts on:

  * High API usage
  * Failures in TTS/STT pipelines
  * Unexpected agent behavior
* Integrate with Slack, email, or internal logs

### 🔧 **Task 15.5 – Prepare Billing Logic (Optional)**

* Track usage by tokens/minutes for each feature
* Calculate monthly cost per user
* Generate invoices or billing summaries

---

## 🔮 Future Prep Suggestions (Optional Phase 16 Onward)

* Add multilingual support via Whisper + OpenAI Translator
* Plug in real-time collaboration (co-browsing, shared chat)
* Create exportable chat summaries for PDF or slideshow formats

