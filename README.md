# LLD Practice API

## Setup

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
2. Start MongoDB locally (or set `MONGODB_URI` to a managed MongoDB connection string).
3. Run `npm install` and `npm run dev` from this folder.

## Auth endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/signup` | Create an account and start a session |
| POST | `/api/v1/auth/login` | Start a session |
| POST | `/api/v1/auth/logout` | End the session |
| GET | `/api/v1/auth/me` | Get the signed-in user |

Sessions use an HTTP-only cookie. Browser clients must send requests with `credentials: 'include'`.
