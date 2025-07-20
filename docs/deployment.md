# 📦 Deployment Guide for AI Presentation Assistant

This guide explains how to deploy the full-stack app to [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/).

---

## 🚀 Live Deployment Setup

| Component        | Status      |
|------------------|-------------|
| Frontend (Slides Viewer) | ✅ Live at: `https://monkfish-app-pcc2z.ondigitalocean.app` |
| Backend API      | ✅ GitHub Auto-deploy from [`main`](https://github.com/CrudenBoy/AIAppCoda) |
| Database         | ✅ PostgreSQL, Managed DB with SSL |
| App Repo         | [`AIAppCoda`](https://github.com/CrudenBoy/AIAppCoda) |

---

## 🔁 Git Auto Deploy

- All updates pushed to the `main` branch of the `backend` or `my-interactive-slides-app` directories trigger auto-deploy.
- Check the App Platform → **Deployments** tab for logs and version history.

---

## 🌐 HTTP Request Routes

| Route | URL |
|-------|-----|
| `/api` | `https://monkfish-app-pcc2z.ondigitalocean.app/api` |
| `/v1` | `https://monkfish-app-pcc2z.ondigitalocean.app/v1` |

---

## 🛠 Build Settings

| Component | Build Command | Output Directory |
|----------|----------------|------------------|
| Frontend | `vite build` | `dist` |

---

## 🔐 Environment Variables

Use the `.env.example` file to replicate your environment locally. In production, set these via the DO UI:

- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, etc.
- `DO_GENAI_API_KEY`

[📘 DigitalOcean Guide on Env Vars →](https://docs.digitalocean.com/products/app-platform/how-to/environment-variables/)

---

## 📄 Deployment Steps (Manual Rebuild)

1. Push code changes to `main`.
2. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps).
3. Click your app → **Components** → **Rebuild** (if not auto-deploying).
4. Monitor logs under the **Deployments** tab.

---

## 🧠 Helpful Links

- [DigitalOcean App Platform Overview](https://docs.digitalocean.com/products/app-platform/)
- [Managing Build Commands](https://docs.digitalocean.com/products/app-platform/how-to/custom-buildpacks/)
- [Environment Variables](https://docs.digitalocean.com/products/app-platform/how-to/environment-variables/)

---

## ✅ License

This project is licensed under the MIT License.
