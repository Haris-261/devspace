# Muhammad Haris — Developer Portfolio

A production-oriented portfolio platform built as three independent TypeScript applications:

- **Public portfolio:** Next.js App Router on port `3000`
- **Admin dashboard:** Next.js App Router on port `3001`
- **REST API:** NestJS modular monolith on port `4000`
- **Persistence:** MongoDB Atlas through Mongoose

The stack was selected because Next.js provides excellent SEO, image optimization, routing, and server rendering for the public experience; a separate Next.js application keeps administration isolated; and NestJS gives authentication and content modules a maintainable structure without unnecessary microservices. MongoDB fits the flexible project, skill, timeline, profile, social-link, and message documents.

## Structure

```text
.
├── frontend/              # Public Next.js portfolio
│   ├── public/
│   └── src/{app,components,lib}/
├── admin/                 # Separate protected Next.js dashboard
│   └── src/{app,components,lib}/
├── backend/               # NestJS REST API and MongoDB schemas
│   └── src/{auth,resources,schemas,upload}.ts
├── package.json           # Workspace orchestration
└── README.md
```

The compact backend source files group closely related NestJS controllers and services; public and protected routes are still separated at the controller level.

## Local setup

Requirements: Node.js 20+, npm 10+, and a MongoDB database.

```bash
npm install
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
copy admin\.env.example admin\.env.local
npm run seed
npm run dev
```

Open:

- Portfolio: `http://localhost:3000`
- Admin: `http://localhost:3001`
- API: `http://localhost:4000/api`

The development bootstrap credentials are `admin@gmail.com` / `admin@123`. The seed creates this account only when no admin exists and never resets it on restart. Change the password immediately from **Account Settings**. For production, set a strong `INITIAL_ADMIN_PASSWORD` before the first seed, run the seed once, and then remove that variable.

## Environment variables

`backend/.env`:

- `MONGODB_URI`: MongoDB connection string. Use a dedicated least-privilege Atlas database user.
- `JWT_SECRET`: at least 32 cryptographically random bytes.
- `FRONTEND_URL` and `ADMIN_URL`: exact allowed CORS origins, without trailing slashes.
- `COOKIE_NAME`: authentication-cookie name.
- `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`: first-run seed only.
- `CLOUDINARY_*`: optional Cloudinary credentials for admin image uploads. Without these, administrators can still supply hosted image URLs.

The two Next.js applications each use `NEXT_PUBLIC_API_URL`, for example `https://api.example.com/api`. Never place database credentials, JWT secrets, or Cloudinary secrets in a `NEXT_PUBLIC_*` variable.

## Commands

```bash
# All applications in watch mode
npm run dev

# Run independently
npm run dev -w frontend
npm run dev -w admin
npm run dev -w backend

# Seed the database (idempotent for initial records)
npm run seed

# Production builds
npm run build

# Production processes after building
npm run start -w frontend
npm run start -w admin
npm run start -w backend
```

## API summary

Public endpoints include `GET /api/portfolio`, `GET /api/projects`, `GET /api/experience`, `GET /api/skills`, `GET /api/profile`, `GET /api/social-links`, and `POST /api/contact`. Public project queries return published records only, and public social queries return enabled records only.

Protected endpoints include `/api/admin/projects`, write operations for experience, skills, profile, social links, contact messages, `/api/upload/image`, and authentication/account routes. Authentication uses a signed short-lived JWT in an HTTP-only cookie; passwords use bcrypt with cost 12; login is rate-limited; CORS is allowlisted; Helmet applies secure response headers.

## Deployment

Deploy the applications independently:

1. **Frontend and admin:** Vercel, Netlify, or Node hosting. Set each project root to `frontend` or `admin`, use `npm run build`, and configure `NEXT_PUBLIC_API_URL` to the HTTPS API URL.
2. **Backend:** Render, Railway, Fly.io, a VPS, or another persistent Node runtime. Build with `npm run build -w backend` from the repository root (or `npm run build` in `backend`) and start with `npm run start -w backend`. Configure every backend environment variable in the provider dashboard.
3. **MongoDB Atlas:** allow the backend host's outbound IP where possible, use TLS, and create a database user scoped to the portfolio database.
4. **CORS and cookies:** use exact HTTPS origins. The current cookie is `sameSite=lax`, suitable when apps share a parent domain. If deploying across unrelated domains, change it to `sameSite='none'` with `secure=true` and add CSRF protection.
5. **Images:** create a Cloudinary account and set the three `CLOUDINARY_*` variables. Uploads are validated as images, limited to 5 MB, transformed for web delivery, and stored in `portfolio/projects`.

Run `npm run seed` once against the production database. Do not expose or commit any `.env` file. Rotate credentials immediately if they are ever copied into logs, chat, issue trackers, or source history.

## Content behavior

The public app requests the live `/api/portfolio` aggregate. Admin saves are therefore reflected automatically (subject to the frontend's 60-second server cache). During backend downtime, the public site uses bundled initial content so the portfolio still renders; production management always uses MongoDB.
