# Changelog

All notable changes to the **Cao Facebook - B2B SaaS Auto Reels Platform** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-08

### Added
- **Core Backend Architecture**:
  - FastAPI asynchronous REST API with OAuth2 / JWT authentication (`/auth/register`, `/auth/login`, `/auth/me`).
  - Native bcrypt password hashing (72-byte truncation protection).
  - PostgreSQL database models via SQLAlchemy: `User`, `Fanpage`, `QuotaLog`, `ReelPost`.
  - AES-256 (Fernet) two-way encryption for Facebook Page Access Tokens with API response masking.
  - Zero-disk streaming buffer architecture via FFmpeg pipes for video processing.
  - Prometheus metrics instrumentation (`/metrics`) and error testing endpoints (`/trigger-500`).

- **Third-Party Integrations**:
  - **Meta Graph API v19.0**: 3-step Reels upload pipeline (`start` upload session, binary chunk `transfer`, `finish` publish).
  - **LLM Content Generation**: Groq LLaMA-3.3-70B API with multi-key failover, OpenAI GPT-4o-mini fallback, and offline viral templates.
  - **Telegram Remote Bot & Notifications**: HTML status reporting, real-time alerts on publish/error, and mobile remote control bot (`/status`, `/pages`, `/setquota`, `/publish_now`, direct video upload handling).

- **Frontend Dashboard (Next.js 14 App Router & Tailwind CSS)**:
  - Responsive mobile drawer navigation with touch-friendly controls (min 44px).
  - **7 Core Modules**:
    1. `Overview` (`/`): High-level KPI cards, zero-disk buffer status, and daily quota totals.
    2. `Fanpages` (`/fanpages`): 9-fanpage directory with mobile card layout, edit modal, active toggles, and instant publish triggers.
    3. `Sources & Quota` (`/sources`): Quota usage progress bars with 55/60 threshold warning and automatic failover to backup URLs.
    4. `Staggered Scheduler` (`/scheduler`): Anti-spam minute-offset schedule matrix (K01 :01 to K09 :09).
    5. `Reports & Insights` (`/reports`): Meta Graph API views, reach, engagement rate, and Top 5 viral reels leaderboard.
    6. `Publish History` (`/reels`): Reels publishing history, live Facebook URLs, and caption/hashtag detail modal.
    7. `Logs & Auto-Repair` (`/errors`): 5-state color-coded log badges and 3-round automatic retry pipeline.
  - Floating AI Assistant Chatbot Drawer for conversational Vietnamese system administration.

- **DevOps, Production & Monitoring**:
  - Docker Compose orchestration for API, Celery Worker, PostgreSQL, Redis, Nginx reverse proxy, Prometheus, Grafana, and Alertmanager.
  - Automated PostgreSQL backup container with AWS S3 synchronization (`s3-sync`) and local fallback.
  - Certbot Let's Encrypt automated SSL certificate provisioning.
  - Alertmanager email notification rules for HTTP 500 error spikes.

- **CI/CD & Quality Assurance**:
  - Full Cypress E2E test suite in `dashboard/cypress/e2e/`.
  - GitHub Actions automated staging workflow (`.github/workflows/staging.yml`).
  - Unit test suite passing 100% (8/8 tests in `tests/`).
  - Complete 10-chapter technical documentation suite in `docs/`.
