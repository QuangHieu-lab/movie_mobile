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

See [CACH_CAI_ENV.md](CACH_CAI_ENV.md) for the complete Windows setup, Gmail OTP, and physical-device instructions.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=movie_theater
DB_USER=root
DB_PASSWORD=

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

DB_SYNC=false
```

Use a strong `JWT_SECRET` outside local development.

### Email OTP

Registration requires an email verification code. For Gmail, create a Google App Password and place it in `SMTP_PASS`; never use or commit the normal Gmail password. The API sends a six-digit code that expires after 10 minutes, accepts at most five incorrect attempts, and allows a new code after 60 seconds.

## Database Setup And Seed Data

The application creates the database tables and loads sample rooms, seats, movies, showtimes, and snacks with one command:

```powershell
npm run db:setup
```

All editable sample data lives in `src/data/seed-data.ts`. Update that file, then run `npm run db:setup` again. Existing records with the same IDs are updated; this command does not delete bookings or users.

### Seed Data Format

Send or edit data using these fields:

```text
Movie: title, genre, rating, description, director, cast, language,
       first_showing, status (NOW_SHOWING or UPCOMING), duration_minutes,
       age_restriction, color_primary, color_secondary

Showtime: movie_id, room_id, start_time, end_time, price
          Dates use YYYY-MM-DDTHH:mm:ss, for example 2026-07-01T19:30:00

Snack: name, type (POPCORN, COMBO, DRINK, or FOOD), price,
       status (AVAILABLE or UNAVAILABLE)
```

Keep IDs stable when updating existing seed entries. Add a new entry with a new ID when it represents a new movie, showtime, or snack.

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
- `GET /api/payments/momo/return`
- `GET /api/payments/status/:orderId`

Booking routes require a bearer token from the auth API.
