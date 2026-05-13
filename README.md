# ChaiBoost ☕🚀

**AI-Powered Business Assistant for Tea & Beverage Small Businesses**

ChaiBoost helps tea shops, bubble tea cafes, coffee houses, and beverage businesses grow their online presence through AI-generated content, smart scheduling, review management, and trend analysis — all from a beautiful mobile app.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Mobile App                     │
│           (Expo / React Native)                  │
│     Navigation · Zustand · React Native Paper    │
└──────────────────┬──────────────────────────────┘
                   │ REST API (Axios)
┌──────────────────▼──────────────────────────────┐
│                 Backend API                       │
│            (Express.js / TypeScript)              │
│  Auth · Content · Scheduling · Reviews · Trends   │
├──────────────────┬──────────────────────────────┤
│    AI Services   │    External APIs              │
│  OpenAI GPT-4o   │  Instagram Graph API          │
│  DALL·E 3        │  Google My Business API       │
│  Prompt Engine   │  Stripe Billing               │
└──────────────────┴──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Data Layer                          │
│  PostgreSQL 16  ·  Redis 7  ·  BullMQ Queues     │
│  S3/R2 Storage  ·  AES-256-GCM Encryption        │
└─────────────────────────────────────────────────┘
```

### Monorepo Structure

| Package     | Description                              |
| ----------- | ---------------------------------------- |
| `shared`    | TypeScript types, constants, enums       |
| `backend`   | Express API server with all business logic |
| `mobile`    | Expo React Native mobile application     |

---

## Features

- **AI Content Studio** — Generate captions, images, videos, and hashtags tailored to your tea brand
- **Smart Scheduling** — Calendar-based post scheduling with optimal time suggestions
- **Review Management** — Monitor and AI-respond to Google & Instagram reviews
- **Trend Analysis** — Discover trending topics, hashtags, and content ideas in the beverage space
- **Analytics Dashboard** — Track engagement, follower growth, and content performance
- **Multi-Platform** — Publish to Instagram and Google My Business from one place
- **Tiered Billing** — Starter, Growth, and Pro plans via Stripe

---

## Prerequisites

- **Node.js** ≥ 18
- **Docker** & **Docker Compose** (for PostgreSQL & Redis)
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Simulator** or **Android Emulator** (for mobile dev)

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/chaiboost.git
cd chaiboost
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your API keys and secrets
```

### 3. Start Database Services

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port 5432 and Redis 7 on port 6379.

### 4. Run Migrations & Seed

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Backend

```bash
npm run dev:backend
```

API runs at `http://localhost:3000`.

### 6. Start Mobile App

```bash
npm run dev:mobile
```

Opens Expo DevTools. Press `i` for iOS simulator or `a` for Android emulator.

---

## Development

### Backend API Endpoints

| Method | Endpoint                      | Description                   |
| ------ | ----------------------------- | ----------------------------- |
| POST   | `/api/auth/register`          | Register new user             |
| POST   | `/api/auth/login`             | Login with email/password     |
| POST   | `/api/auth/verify-otp`        | Verify OTP code               |
| GET    | `/api/auth/instagram`         | Start Instagram OAuth         |
| GET    | `/api/auth/instagram/callback`| Instagram OAuth callback      |
| POST   | `/api/business`               | Create/update business        |
| GET    | `/api/business/profile`       | Get business profile          |
| POST   | `/api/content/generate`       | Generate AI content           |
| GET    | `/api/content`                | List content pieces           |
| POST   | `/api/schedule`               | Schedule a post               |
| GET    | `/api/schedule`               | Get scheduled posts           |
| GET    | `/api/reviews`                | List reviews                  |
| POST   | `/api/reviews/:id/respond`    | AI-respond to a review        |
| GET    | `/api/trends`                 | Get trending topics           |
| GET    | `/api/analytics/overview`     | Analytics overview            |
| POST   | `/api/webhooks/stripe`        | Stripe webhook handler        |

### Shared Types

The `packages/shared` package exports all TypeScript interfaces and constants used across backend and mobile. Import them as:

```typescript
import { User, Business, ContentPiece, TIER_LIMITS } from '@chaiboost/shared';
```

### Testing

```bash
npm run test
```

### Code Structure Conventions

- **Services** contain business logic, are stateless, and are testable in isolation
- **Routes** are thin controllers that validate input and delegate to services
- **AI modules** encapsulate all prompt engineering and LLM interaction
- **Middleware** handles cross-cutting concerns (auth, rate limiting, tier enforcement)

---

## Deployment

### Backend

The backend is a standard Node.js Express app. Deploy to any platform supporting Node.js:

```bash
npm run build:backend
node packages/backend/dist/index.js
```

### Mobile

Build with EAS:

```bash
cd packages/mobile
eas build --platform all
```

---

## Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| Mobile         | Expo SDK 51+, React Navigation 6, Zustand     |
| UI Components  | React Native Paper                            |
| Backend        | Express.js, TypeScript                        |
| Database       | PostgreSQL 16                                 |
| Cache/Queue    | Redis 7, BullMQ                               |
| AI             | OpenAI GPT-4o, DALL·E 3                       |
| Auth           | JWT, AES-256-GCM encryption                   |
| Billing        | Stripe                                        |
| Storage        | S3 / Cloudflare R2                            |
| Image Process  | Sharp                                         |

---

## License

MIT © ChaiBoost Team
