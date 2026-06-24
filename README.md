# Movie Mobile

Backend API for a movie booking mobile app, with a small Flutter authentication app kept under `auth/`.

## Project Structure

```text
movie_mobile/
├── src/                  # Express + Sequelize backend source
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication middleware
│   ├── models/           # Sequelize models and associations
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Shared utilities
├── sql/                  # MySQL schema
├── auth/                 # Flutter authentication app
├── .env.example          # Safe environment template
├── package.json          # Backend scripts and dependencies
└── tsconfig.json         # TypeScript configuration
```

Generated folders and runtime files such as `node_modules/`, `dist/`, logs, and the real `.env` file are intentionally ignored.

## Requirements

- Node.js
- MySQL Server 8.x
- npm

## Environment

Copy `.env.example` to `.env` and update values for your local machine.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=movie_mobile
DB_USER=root
DB_PASSWORD=

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

DB_SYNC=false
```

Use a strong `JWT_SECRET` outside local development.

## Database Setup

Create the database and tables from the schema:

```powershell
Get-Content sql\schema.sql | mysql -h 127.0.0.1 -P 3306 -u root -p
```

The schema creates the core booking tables plus the `Payments` table used by the payment API.

## Backend Commands

Install dependencies:

```powershell
npm install
```

Build TypeScript:

```powershell
npm run build
```

Run the API:

```powershell
npm start
```

Development mode:

```powershell
npm run dev
```

## Main API Routes

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/movies`
- `POST /api/movies`
- `GET /api/showtimes`
- `POST /api/showtimes`
- `GET /api/showtimes/:showtimeId/seats`
- `GET /api/bookings/me`
- `POST /api/bookings`
- `POST /api/payments/create`
- `POST /api/payments/webhook`
- `GET /api/payments/status/:orderId`

Booking routes require a bearer token from the auth API.
