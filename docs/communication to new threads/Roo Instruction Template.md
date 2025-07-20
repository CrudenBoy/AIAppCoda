# Roo Instruction Template


## Summary

This refined template embeds your **environment context** (VS Code, Gemini as PM, Roo Code Agent, DigitalOcean App Platform with Node.js/Express, PostgreSQL via TablePlus, GitHub-triggered CI/CD, and a connected Coda Pack). It enforces **small, focused scopes**, **hallucination checks**, and **feedback loops** so Roo stays on task. Guardrails prompt Roo to confirm understanding and cite its reasoning, minimizing drift and ensuring reliability.

---

## 1. Context & Metadata

```markdown
**Prompt ID**: VCA_002  
**Author**: David  
**Date**: 2025-06-29  
**Environment**:  
- Editor: VS Code with Roo Code extension :contentReference[oaicite:0]{index=0}  
- AI Roles: Gemini (Project Manager); Roo (Code Agent)  
- Deployment: DigitalOcean App Platform (Node.js Buildpack) :contentReference[oaicite:1]{index=1}  
- Database: PostgreSQL (managed via TablePlus, SSH tunnel) :contentReference[oaicite:2]{index=2}  
- CI/CD: GitHub → DO App Platform (auto-deploy) :contentReference[oaicite:3]{index=3}  
- Integration: Coda Pack (using @codahq/packs-sdk best practices) :contentReference[oaicite:4]{index=4}  
```

---

## 2. S.C.A.F.F. Prompt Structure

### Situation

“We’re in the `main` branch of our VS Code workspace. App Platform auto-deploys on push. The Express server (Node 22 LTS) runs on DO, connects to Postgres via TablePlus SSH tunnel, and our Coda Pack syncs data.” ([docs.digitalocean.com][1])

### Challenge

“The `/tasks` API is hanging mid-request, causing the Coda Pack sync to fail.” ([stackoverflow.com][2])

### Ask (Objective)

“Diagnose and fix the hanging `/tasks` endpoint in `server.js`.” ([backslash.security][3])

### Focus (Scope)

* Files: `routes/tasks.js`, `db/pool.js`
* Components: Express middleware, PgBouncer config, Coda sync formula parameters
* Exclude: Frontend React code and other endpoints
  This narrow scope avoids overwhelming Roo ([arxiv.org][4])

### Framing (Constraints)

* Maintain existing lint rules (ESLint + Prettier) ([code.visualstudio.com][5])
* No new dependencies
* Use async/await and parameterized queries only
* Add inline comments per Coda SDK guidance ([coda.io][6])

### Finish (Desired Output)

1. **Analysis**: Clear root-cause description with log excerpts
2. **Patch**: Diff for `tasks.js` and `pool.js`
3. **Test**: Jest test for `/tasks?docId=` case
4. **Docs**: README update and inline comments
5. **Validation**: Confirmation that Coda Pack sync works locally

---

## 3. Guardrails & Hallucination Checks

* **“Roo, please confirm your understanding of the task before proceeding.”** Prompt the agent to restate objectives. ([reddit.com][7])
* **“After your analysis, list any assumptions made.”** Forces transparency. ([backslash.security][3])
* **“If you’re uncertain or hallucinating, stop and ask for clarification.”** Ensures human approval for ambiguous steps. ([reddit.com][7])

---

### 4. Source of Truth & Core Documentation

All project context and requirements are located within this repository. Reference these key documents as the primary source of truth:

* **Product Requirements (PRD):** `docs/prd/PRD_v2.md`
* **Development Playbook:** `docs/playbooks/VIBE_CODING_PLAYBOOK.md`
* **AI Assistant Knowledge Base:** `docs/knowledge-base/VIBE_CODING_ASSISTANT_KB.md`
* **Task-Specific Documents:** `docs/tasks/`

## 5. Iterative Feedback Loop

1. **Stage 1**: Ask Roo to **confirm context** and **replicate** the hanging behavior.
2. **Stage 2**: Request **root-cause analysis**, including logs or metrics from DO App Platform.
3. **Stage 3**: Provide a **code diff** and ask Roo to **highlight lines changed**.
4. **Stage 4**: Ask for a **unit test snippet** and check that it fails before patch, passes after.
5. **Stage 5**: Review, ask Roo to **summarize changes** and **cite which DO buildpack docs** it followed ([docs.digitalocean.com][1]).

At each stage, require Roo to ask: “Is this meeting your requirements?” ([reddit.com][7])

---

## 5. Human Oversight & CI/CD Integration

* **Branch**: `vca/002-fix-tasks-hang`
* **Commit messages**: semantic (e.g., `fix(tasks): resolve hanging query by adding pool timeout`)   ([code.visualstudio.com][8])
* **PR checklist**: run `npm test`, verify DO deploy logs show `/tasks` success, confirm Coda Pack sync in dev doc. ([community.coda.io][9])
* **Merge** & **delete** branch on approval.

---

## 6. Why This Works

* **Small scopes** prevent AI context overload ([code.visualstudio.com][10])
* **S.C.A.F.F + guardrails** structure prompts as mini-specs ([youtube.com][11])
* **Feedback loops** catch hallucinations early ([backslash.security][3])
* **Coda Pack SDK & DO docs** ensure alignment with platform conventions ([coda.io][6], [docs.digitalocean.com][1])

---

**Next Steps**

* Save this in your `.github/copilot-instructions.md` or as a VS Code prompt file ([code.visualstudio.com][5]).
* Adapt IDs and scope for each new issue.
* Keep refining with real-world feedback from Roo.

This template centers your **VS Code + Roo Code + DO + Coda** workflow in a concise, iterative, and verifiable structure—maximizing productivity while safeguarding code quality.

[1]: https://docs.digitalocean.com/products/app-platform/reference/buildpacks/nodejs/?utm_source=chatgpt.com "Node.js Buildpack on App Platform | DigitalOcean Documentation"
[2]: https://stackoverflow.com/questions/67600006/i-am-not-able-to-connect-my-tableplus-to-digital-ocean-postgresql-database?utm_source=chatgpt.com "I am not able to connect my TablePlus to digital ocean postgresql ..."
[3]: https://www.backslash.security/blog/harnessing-prompt-rules-for-secure-code-generation?utm_source=chatgpt.com "Harnessing Prompt Rules for Secure Code Generation - Backslash"
[4]: https://arxiv.org/abs/2506.01604?utm_source=chatgpt.com "Exploring Prompt Patterns in AI-Assisted Code Generation: Towards Faster and More Effective Developer-AI Collaboration"
[5]: https://code.visualstudio.com/blogs/2025/03/26/custom-instructions?utm_source=chatgpt.com "Context is all you need: Better AI results with custom instructions"
[6]: https://coda.io/packs/build/latest/guides/best-practices/?utm_source=chatgpt.com "Best practices - Coda Pack SDK"
[7]: https://www.reddit.com/r/ChatGPTCoding/comments/1f51y8s/a_collection_of_prompts_for_generating_high/?utm_source=chatgpt.com "A collection of prompts for generating high quality code... - Reddit"
[8]: https://code.visualstudio.com/docs/copilot/copilot-customization?utm_source=chatgpt.com "Customize AI responses in VS Code"
[9]: https://community.coda.io/t/ai-prompt-best-practices/42941?utm_source=chatgpt.com "AI Prompt Best Practices - Coda Maker Community"
[10]: https://code.visualstudio.com/docs/copilot/chat/prompt-crafting?utm_source=chatgpt.com "Prompt engineering for Copilot Chat - Visual Studio Code"
[11]: https://www.youtube.com/watch?v=wPFyOqdabRs&utm_source=chatgpt.com "Setting Up Windows to Build Coda Packs | Part 1 - YouTube"
