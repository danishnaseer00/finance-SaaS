# FinSense

AI-powered personal finance tracker with smart budgeting insights.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind |
| Backend | Node.js + Express + Prisma |
| Database | PostgreSQL |
| AI | OpenRouter API |
| Auth | Firebase + JWT |

## Features

- Dashboard with income/expense analytics
- Transaction & account management
- AI chat assistant for financial advice
- Auto-generated budget recommendations
- Monthly reports

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [Neon](https://neon.tech) |

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
- Lints and builds frontend
- Lints backend
- Auto-deploys to Render on `main` branch

## Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up
```

## Local Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY

# Run migrations
npm run db:migrate

# Start dev servers
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `CLIENT_URL` | Frontend URL (for CORS) |

## License

MIT
