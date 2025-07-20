# **Example of section in Task file**

# Task 14.2 – Implement STT Integration

## 🎯 Objective
Integrate frontend mic input with OpenAI Whisper via DigitalOcean to provide real-time speech-to-text functionality in the chatbot interface.

## 🔗 Reference Docs
- [DO Whisper STT Guide](https://www.digitalocean.com/community/tutorials/realtime-audio-translation-using-openai-api-on-open-webui)

## 📁 Files Involved
- `components/VoiceButton.jsx`
- `routes/api/stt.js`
- `lib/stt/whisper.js`

---

## 📌 Subtask Tracker

| Subtask ID | Description | Files | Commit Ref | Notes |
|------------|-------------|-------|------------|-------|
| 14.2.1 | Create mic input UI | `VoiceButton.jsx` | `b1e2c34` | Captures voice input |
| 14.2.2 | Add Whisper API backend handler | `stt.js`, `whisper.js` | `c3d2a90` | Sends audio and returns text |
| 14.2.3 | Connect to chatbot context | `chat/index.js` | `d7e0f12` | Injects transcribed text to agent |

---

## ✅ Completion Checklist

- [x] Frontend mic capture integrated with UI trigger
- [x] Audio blob sent to `/api/v1/stt` endpoint
- [x] OpenAI Whisper API returns transcription
- [x] Transcription successfully integrated into chatbot input flow

**Final Output Description**:  
A working UI component (`VoiceButton.jsx`) that allows users to speak to the app. Their voice is recorded and securely sent to a backend handler using OpenAI Whisper. The resulting transcript is injected directly into the chatbot context, enabling seamless conversational interaction.

---

## 🔄 Roo Task Updates

To be filled at the end of each subtask:

```markdown
## 🔄 Roo Task Update (14.2.X)

**Summary**:  
**Commits**:  
**Blockers**:  
**Next**:
