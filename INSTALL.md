# 🇵🇭 Gabay: Tagalog Learning Protocol: Installation & Setup Guide

Welcome to **Gabay**, the rhythmic Tagalog learning helper designed to build your vocabulary through music and AI-powered insights. This guide provides comprehensive instructions for deploying and configuring your instance.

---

## 📖 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Repository Setup](#-1-repository-setup)
3. [Configuration & API Keys](#-2-configuration--api-keys)
4. [Deployment](#-3-deployment)
5. [Initial Onboarding](#-4-initial-onboarding)
6. [Monitoring & Limits](#-6-monitoring--limits)
7. [Troubleshooting](#-7-troubleshooting)
8. [License](#-8-license)

---

## 📋 Prerequisites

Ensure your system meets the following requirements:

### Server Requirements
- **Docker & Docker Compose** (Required for production deployment)
- **Git** (for version control)
- **Node.js 18+** (only if running without Docker)

### System Preparation (Ubuntu/Debian)

```bash
# Update system and install dependencies
sudo apt update && sudo apt install -y ca-certificates curl gnupg git

# Install Docker Engine (Official Repository)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 🛠️ 1. Repository Setup

Clone the repository and navigate to the project root:

```bash
git clone https://github.com/your-repo/gabay.git
cd gabay
```

---

## 🔑 2. Configuration & API Keys

Gabay relies on external services for AI reasoning and secure authentication. Copy the example environment file and populate it with your credentials:

```bash
cp .env.example .env
nano .env
```

### A. Core AI (Required)
- **Google Gemini API**: Powers lyrics extraction, translations, and linguistic analysis. Obtain at [Google AI Studio](https://aistudio.google.com/).
  - Set `GEMINI_API_KEY`.

### B. Authentication (Required)
- **Google OAuth**: Required for secure user login.
  1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
  2. Configure the **OAuth Consent Screen**.
  3. Create **OAuth 2.0 Client IDs** (Web Application).
  4. Add your App URL (e.g., `https://gabay.example.com`) to **Authorized JavaScript origins**.
  5. Add `[Your App URL]/auth/callback` to **Authorized redirect URIs**.
  - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **Admin Email**: Specify your primary administrator's email for elevated access.
  - Set `ADMIN_EMAIL`.
- **Session Secret**: A unique string for signing session cookies.
  - Set `SESSION_SECRET` (generate one with `openssl rand -hex 32`).

### C. Application Environment
- **App URL**: The public-facing URL of your deployment.
  - Set `APP_URL`.

---

## 🚀 3. Deployment

### Docker Deployment (Production)

Gabay is configured to run as a single container with a local SQLite database (`postgress.db`) persisted via volumes.

```bash
# Build and start services in detached mode
docker compose up -d --build

# Monitor logs
docker compose logs -f
```

---

## 🏁 4. Initial Onboarding

1. **First Login**: Sign in with the Google account matching the `ADMIN_EMAIL` specified in your `.env`.
2. **Explore Vocabulary**: Browse the built-in dictionary or start adding new Tagalog phrases.
3. **Analyze Lyrics**: Use the AI tool to break down Tagalog songs and learn the rhythmic nuances of the language.

---

## 📱 5. Mobile Access & AI Protocol
Gabay is designed for offline-first, rhythmic learning.

### PWA Installation
For the best experience, install Gabay as a "web app":
- **iOS**: Open in Safari > Share > **Add to Home Screen**.
- **Android**: Open in Chrome > Menu > **Install App**.

### 🛫 Airport Learning Mode (Offline)
Gabay supports full offline capabilities when your device supports the **Web Prompt API**:
1. **Enable Local AI**: In the dashboard sidebar, if your browser supports it, you will see a "Local Prompt API" option. Toggle this to **ACTIVE**.
2. **Offline Data**: The Service Worker caches the core UI and your recently synced vocabulary.
3. **Local Reasoning**: Even without internet, Gabay can generate example sentences and conduct roleplay conversations using your device's native silicon (Tensor/A-series/WebGPU).

**Note**: Voice synthesis (TTS) and Song Exploration still require an active connection for cloud-based processing.

---

## 📊 6. Monitoring & Limits

- **AI Usage**: Monitor your Gemini API quota in the Google AI Studio dashboard.
- **Database**: The local SQLite database is stored at `/app/postgress.db` inside the container and mapped to your host for easy backups.

---

## ❓ 7. Troubleshooting

- **Login Fails**: Ensure your `GOOGLE_CLIENT_ID` is correct and the redirect URI matches exactly in the Google Cloud Console.
- **AI Not Responding**: Verify your `GEMINI_API_KEY` status and ensure your server has outbound internet access to Google's API endpoints.
- **Data Not Persisting**: Check host permissions for the `postgress.db` file to ensure the Docker user can write to it.

---

## 📄 8. License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

- **Attribution**: Credit must be given to the creator (**Yan Boily**).
- **Non-Commercial**: Commercial use is strictly prohibited.

See [LICENSE.md](./LICENSE.md) for full details.

---
*Gabay: Learn with Rhythm. Master with Heart.*
