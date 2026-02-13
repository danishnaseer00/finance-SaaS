# FinSense - AI-Powered Financial Tracking

A modern web application for personal finance tracking with AI-powered insights, built with React, Node.js, Express, PostgreSQL, and Openrouter.


## Features

- 📊 **Dashboard** - Real-time financial overview with income/expense charts
- 💰 **Transaction Management** - Add, edit, delete, and filter transactions
- 🤖 **AI Chat Assistant** - Get personalized financial advice powered by Gemini
- 📈 **Smart Insights** - AI-generated spending analysis and recommendations
- 📋 **Budget Planning** - AI-generated personalized budget plans
- 📄 **Reports** - Monthly financial reports with downloadable summaries
- 🔐 **Authentication** - Secure JWT-based user authentication

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Recharts for data visualization
- React Router v6
- Axios for API calls

### Backend
- Node.js + Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication
- Zod validation
- Openrouter

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Google Gemini API Key

## Getting Started

### 1. Clone and Install

```bash
cd finance-SaaS
npm install
```

### 2. Environment Setup

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finsense?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# OPENROUTER_KEY


# Server
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Create the database
createdb finsense

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# (Optional) Seed demo data
npm run db:seed
```

### 4. Start Development

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
finance-SaaS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── ...
├── server/                 # Express backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Seed data
│   └── src/
│       ├── config/         # Configuration
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Express middleware
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       └── validators/     # Zod schemas
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/snapshot` - Financial snapshot
- `GET /api/analytics/trends` - Monthly trends
- `GET /api/analytics/categories` - Category breakdown

### AI
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/insights` - Get AI insights
- `GET /api/ai/budget-plan` - Generate budget plan
- `GET /api/ai/chat-history` - Get chat history

## License

MIT
