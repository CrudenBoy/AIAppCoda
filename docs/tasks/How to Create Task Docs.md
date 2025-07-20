

# 📘 How to Create Task Docs (`docs/tasks/*.md`)

## 🎯 Objective

This document explains how to create and maintain structured task documentation using DigitalOcean Navigator GPT (DON). Each task should have its own `.md` file inside `docs/tasks/`, and DON will help generate it based on your PRD, code changes, and DigitalOcean official docs.

---

## 🧩 Folder Structure Example

```

docs/
├─ tasks/
│   ├─ task-13.1-chatbot-ui.md
│   ├─ task-14.2-stt-integration.md
│   ├─ task-14.4-tts-integration.md
│   ├─ README.md ← You are here

````

---

## 🧵 One GPT Thread Per Task

Each task (e.g., “Task 14.2 – Implement STT Integration”) should be handled in **its own GPT thread**. This helps DON focus and gives you a single source of truth per implementation step.

---

## 🛠 Step-by-Step Instructions

### ✅ Step 1: Create a New GPT Thread

Use the **DigitalOcean Navigator GPT**. Then paste the following prompt:

---

### 🧠 Template Prompt to Give DON:
```plaintext
I’m working on Task 14.2 – Implement STT Integration using OpenAI Whisper.

📄 PRD Summary:
“Integrate frontend mic capture using MediaRecorder. Send audio to backend endpoint `/api/v1/stt`, which forwards it to OpenAI Whisper and returns transcribed text to the chatbot agent.”

🔗 Reference Doc:
https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui

🧩 Updated Files:
- `components/VoiceButton.jsx`
- `routes/api/stt.js`

📦 Roo Code has made these updates. Please create a `docs/tasks/task-14.2-stt-integration.md` file with:
- Task title and description
- Implementation summary
- DO documentation link(s)
- Subplan prompt
- Lesson plan prompt
- Acceptance criteria
- Open issues or follow-up
````

---

### ✅ Step 2: Review GPT Output

DON will return a full Markdown block. Copy that output into your project repo as:

```
docs/tasks/task-14.2-stt-integration.md
```

---

## 🧪 Example Output File (Excerpt)

```markdown
# 🧠 Task 14.2 – Implement STT Integration

## 🎯 Objective
Implement frontend mic capture and backend routing to OpenAI Whisper API to convert speech to text.

## 🔗 References
- [DigitalOcean Whisper STT Guide](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui)

## 📁 Files Involved
- `components/VoiceButton.jsx`
- `routes/api/stt.js`

## ✅ Acceptance Criteria
- Mic icon triggers recording
- Whisper API returns accurate transcription
- Latency under 3 seconds

## 📘 Subplan Prompt
“Create a step-by-step plan to integrate browser audio recording with MediaRecorder and call Whisper API using backend routing at `/api/v1/stt`.”

## 🎓 Lesson Plan Prompt
“Teach how to build a full STT pipeline using OpenAI Whisper API and the DO Whisper guide. Include audio UX, backend routing, and fallback handling.”
```

---

## 📌 Tips

* Include GitHub commit hashes if possible
* Save the GPT thread link in a comments section of the file for traceability
* Keep task names aligned with PRD task numbers

---

## 🧰 Optional Tools

* [doctl CLI](https://docs.digitalocean.com/reference/doctl/)
* [GradientAI KB API Guide](https://docs.digitalocean.com/products/gradientai-platform/how-to/create-manage-agent-knowledge-bases/)

---

For any questions, paste this README into your GPT thread to remind DON what format to use.

```

---


