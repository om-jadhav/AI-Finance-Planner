# Finance Planner — PERN Setup

## What's included
- **Backend**: Express + Prisma (Postgres via Supabase) + JWT auth (access + refresh, with rotation)
- **Frontend**: React (Vite) + React Router, axios client with auto token-refresh
- Refresh tokens are httpOnly cookies (safe from XSS); access tokens live in memory on the client

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — from Supabase Dashboard → Project Settings → Database → Connection String (URI). Use the **Session pooler** or direct connection string, swap in your DB password.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate two different random strings: `openssl rand -base64 48`

Then:
```bash
npm run prisma:migrate   # creates users + refresh_tokens tables in Supabase
npm run dev               # starts server on :5000
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev   # starts on :5173
```

## Auth flow summary
1. **Register/Login** → backend returns `accessToken` in the response body + sets `refreshToken` as an httpOnly cookie
2. Access token is kept in memory on the frontend (`src/api/client.js`), attached to every request as `Authorization: Bearer <token>`
3. When the access token expires (15 min default), the axios interceptor automatically calls `/auth/refresh`, gets a new access token, and retries the failed request — no user-facing interruption
4. On page reload, the access token is lost (it was only in memory), so `AuthContext` calls `/auth/refresh` on mount to silently restore the session from the cookie
5. Refresh tokens are stored in the DB and rotated on every use — old ones are marked `revoked`, so a leaked old token can't be replayed

## For your teammates building features
- Copy the pattern in `backend/src/routes/profile.routes.js` for new protected endpoints — just wrap with `requireAuth` middleware, and `req.userId` gives you the logged-in user's ID
- Add new fields to the `User` model in `backend/prisma/schema.prisma` (net worth, risk score, goals are stubbed as comments) then run `npm run prisma:migrate` again
- The GenAI plan-generation endpoints your teammate builds should also sit behind `requireAuth` so plans are tied to a real logged-in user

## Security notes for the panel (if asked)
- Passwords hashed with bcrypt (cost factor 12), never stored in plaintext
- Refresh tokens are rotated + revocable server-side — not just trusting the client's token forever
- Access tokens are short-lived (15 min) so a leaked one has a small blast radius
- CORS is locked to your frontend origin only, with credentials enabled for the cookie
