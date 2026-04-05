# Anishnova Employee Verification Platform

Production-ready employee verification and admin management platform built with Next.js 14, MongoDB, JWT authentication, QR generation, CSV bulk operations, face verification workflows, and ID card export.

## Features

- Public employee verification via `https://employee.anishnova.com/verify/[employeeID]`
- Public employee search page
- QR scanner page and face verification workflow
- Admin login with JWT cookie auth
- Employee CRUD, activation, deactivation, delete
- Bulk CSV import
- QR code generation and bulk QR ZIP download
- Employee ID card PNG and PDF export
- Blockchain-ready verification hashes
- Verification log tracking and fake attempt monitoring
- Cloudinary upload with data URI fallback
- Vercel-ready App Router architecture

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start development:

```bash
npm run dev
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `NEXT_PUBLIC_APP_URL`: public production URL, default should be `https://employee.anishnova.com`
- `ADMIN_EMAIL`: bootstrap admin email
- `ADMIN_PASSWORD`: bootstrap admin password
- `EMPLOYEE_ID_PREFIX`: default employee ID prefix such as `AN`
- `CLOUDINARY_CLOUD_NAME`: optional
- `CLOUDINARY_API_KEY`: optional
- `CLOUDINARY_API_SECRET`: optional

## Vercel Deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example`.
4. Add the custom domain `employee.anishnova.com` inside Vercel project settings.
5. Deploy.

The platform auto-bootstraps the first admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
