### README.md

```markdown
# AI Presenter Assistant & Coda Integration

This repository contains the full monorepo for an AI-powered presentation assistant. The application allows users to interact with a slide presentation via a chatbot, using voice commands for a hands-free experience. All tasks and application content are synchronized with a Coda doc via a custom Coda Pack.

## ✨ Overview

The project is designed to enhance presentations by providing a real-time, voice-enabled AI assistant that can answer questions and complete tasks based on the presentation content. It's built with a modern web stack and follows the "Vibe Coding" methodology for AI-assisted development.

**Core Components:**
* **React Frontend:** A user-facing application to display slides and interact with the AI chatbot.
* **Node.js Backend:** An Express server that handles API requests, AI processing (STT/TTS), and database interactions.
* **Coda Pack:** A custom pack that enables two-way data synchronization between the web application and a Coda doc.

## 🚀 Tech Stack

| Area       | Technology                                                        |
| :--------- | :---------------------------------------------------------------- |
| Frontend   | React, TypeScript, Vite, Zustand                                  |
| Backend    | Node.js, Express.js                                               |
| Database   | PostgreSQL (DigitalOcean Managed Database)                        |
| AI         | OpenAI (Whisper for STT, TTS)                                     |
| Coda Pack  | Coda Packs SDK, TypeScript                                        |
| Deployment | DigitalOcean App Platform                                         |

## 📂 Project Structure

This project is a monorepo containing three main packages and a comprehensive documentation folder:

```

├── .github/              \# Contains templates for our workflow
├── backend/              \# Node.js/Express API server
├── coda-pack/            \# Custom Coda Pack for Coda integration
├── docs/                 \# All project documentation
├── my-interactive-slides-app/ \# React frontend application
└── README.md             \# You are here

```

## ⚙️ Environment & Deployment

This project is configured for auto-deployment to **DigitalOcean App Platform** from the `main` branch of the `CrudenBoy/AIAppCoda` repository.

### Environment Variables

The backend server requires a `.env` file with database credentials. Create a `backend/.env` file for local development. An example is provided in `backend/.env.example`.

### Database Configuration

* **Service:** DigitalOcean Managed PostgreSQL
* **SSL Mode:** `require`
* **Connection Details:** Stored in environment variables.

### Deployment - Backend (App Platform)

* **Repository:** `https://github.com/CrudenBoy/AIAppCoda`
* **Branch:** `main`
* **Source Directory:** `backend`
* **Autodeploy:** ✅ On
* **HTTP Routes:**
    * `/v1` is mapped to `/v1`
    * `/api` is mapped to `/api`

### Deployment - Frontend (App Platform)

* **Repository:** `https://github.com/CrudenBoy/AIAppCoda`
* **Source Directory:** `my-interactive-slides-app`
* **Build Command:** `vite build`
* **Output Directory:** `dist`

## 🤖 Development Workflow: "Vibe Coding"

This project follows a structured AI-assisted development process. For full details, see the [Vibe Coding Playbook](docs/playbooks/VIBE_CODING_PLAYBOOK.md).

1.  **Task Definition (DON):** The DigitalOcean Navigator (DON) creates a task file in `docs/tasks/`.
2.  **Prompt Generation (Vibe Codex):** The Vibe Codex AI creates a S.C.A.F.F. prompt for the coding agent.
3.  **Code Implementation (Roo):** The Roo Code Agent executes the prompt.
4.  **Documentation Update (Roo):** Roo updates the corresponding task file in `docs/tasks/`.
5.  **Review & Integration (David):** The human developer reviews, tests, and merges the changes.

## 📚 Key Documentation

* [**Product Requirements Document (PRD_v2.md)**](docs/prd/PRD_v2.md)
* [**Vibe Coding Playbook**](docs/playbooks/VIBE_CODING_PLAYBOOK.md)
* [**AI Assistant Knowledge Base**](docs/knowledge-base/VIBE_CODING_ASSISTANT_KB.md)
* [**Task Breakdowns**](docs/tasks/)
* [**Deployment Instructions**](docs/deployment.md)

```

