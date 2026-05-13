# ChaiBoost — Next Steps & Roadmap

## 🔥 Immediate (Next Session)

### 1. Push to GitHub
```bash
gh auth login
gh repo create chaiboost --public --source=. --push
```

### 2. Install Dependencies & Run Locally
```bash
# Start databases
docker compose up -d

# Backend
cd packages/backend
npm install
npm run dev

# Mobile (new terminal)
cd packages/mobile
npm install
npx expo start
```

### 3. Fix Any Build Errors
- Resolve TypeScript import issues
- Ensure shared package is linked correctly
- Test API health endpoint: `curl http://localhost:3000/health`

### 4. Test on Phone
- Install **Expo Go** on Android
- Scan QR code from `npx expo start`
- Verify screens load and navigation works

---

## 📱 Building APK (Personal Use)

```bash
cd packages/mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK (cloud build, ~15 min)
eas build -p android --profile preview

# Download APK from the link provided
# Install on Android device
```

---

## 🔑 API Keys to Configure

| Service | Key | Where to Get |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| Instagram | `INSTAGRAM_APP_ID` + `INSTAGRAM_APP_SECRET` | https://developers.facebook.com |
| Google My Business | `GMB_CLIENT_ID` + `GMB_CLIENT_SECRET` | https://console.cloud.google.com |
| Stripe | `STRIPE_SECRET_KEY` | https://dashboard.stripe.com |
| Cloudflare R2 | `STORAGE_*` vars | https://dash.cloudflare.com |

---

## 🛠️ Phase 2 Features (Future)

- [ ] WhatsApp Business integration
- [ ] Trending video remix engine
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Competitor analysis module
- [ ] PDF analytics report export
- [ ] Push notification system
- [ ] Offline mode with content queue
- [ ] Custom template editor
- [ ] A/B testing for captions
- [ ] Voice-over for videos (TTS)

---

## 📊 Architecture Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Mobile framework | Expo (React Native) | Cross-platform, easy APK builds |
| State management | Zustand | Simple, no boilerplate |
| Backend | Express + TypeScript | Fast to develop, huge ecosystem |
| Database | PostgreSQL | Relational data, JSON support |
| Job queue | BullMQ | Redis-backed, reliable |
| AI text | OpenAI GPT-4o-mini | Best cost/quality ratio |
| AI images | Stability AI SDXL | Free tier, good food photos |
| Video rendering | FFmpeg + Remotion | Open source, no per-unit cost |
| Auth | JWT + OAuth2 | Social login for Instagram/GMB |
| Payments | Stripe | UPI support for India |

---

## 🐛 Known Issues / TODOs

- [ ] Instagram OAuth needs Meta app review for `instagram_content_publish` scope
- [ ] GMB API needs Google Cloud project with billing enabled
- [ ] Video rendering needs dedicated compute for production (currently local FFmpeg)
- [ ] Trend data collection needs a cron scheduler service
- [ ] Rate limiting needs Redis-backed distributed counter for multi-instance
- [ ] Image generation prompts need A/B testing with real users
- [ ] Review auto-response needs sentiment confidence threshold tuning

---

## 📁 File Structure Summary

```
chaiboost/
├── packages/backend/   (46 files) — Express.js API
├── packages/mobile/    (71 files) — Expo React Native app
├── packages/shared/    (10 files) — Types & constants
├── docker-compose.yml  — PostgreSQL + Redis
├── .env.example        — All env vars documented
└── TODO.md             — This file
```

**Total: 127 files, 12,646 lines of code**
