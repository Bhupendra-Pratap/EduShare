# 📚 EduShare

A full-stack academic note-sharing platform for universities and colleges.

## Features
- 🏫 Multi-institution support with isolated academic spaces
- 🪪 ID card verification flow (admin-reviewed)
- 👩‍🎓 Student panel — upload, browse, vote, bookmark notes
- 👨‍🏫 Teacher panel — upload materials, verify student notes
- 🛡️ Admin panel — manage institutions, departments, users
- 📁 File uploads (PDF, images, text, links)
- 🔐 JWT auth with HTTP-only cookies

## Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Styling**: Tailwind CSS
- **Deployment**: Docker + Docker Compose

---

## 🚀 Quick Start (Docker — recommended)

### Prerequisites
- Docker + Docker Compose installed

### Steps

```bash
# 1. Clone / unzip the project
cd edushare

# 2. Start everything
docker-compose up -d

# 3. Run migrations + seed
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx tsx prisma/seed.ts
```

Open: http://localhost:3000

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# Edit .env:
# DATABASE_URL="postgresql://youruser:yourpass@localhost:5432/edushare_db"
# JWT_SECRET="your-secret-min-32-chars"

# 3. Push schema to database
npx prisma db push

# 4. Seed demo data
npx tsx prisma/seed.ts

# 5. Run dev server
npm run dev
```

Open: http://localhost:3000

---



## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx               # Landing page
│   ├── auth/
│   │   ├── login/             # Login page
│   │   └── register/          # 3-step registration
│   ├── admin/                 # Admin panel
│   │   ├── page.tsx           # Dashboard
│   │   ├── institutions/      # Manage institutions
│   │   ├── departments/       # Departments & subjects
│   │   ├── verifications/     # Review ID cards
│   │   ├── users/             # Manage users
│   │   └── notes/             # All notes
│   ├── student/               # Student panel
│   │   ├── dashboard/
│   │   ├── subjects/
│   │   ├── notes/
│   │   ├── upload/
│   │   ├── bookmarks/
│   │   └── profile/
│   ├── teacher/               # Teacher panel
│   │   ├── dashboard/
│   │   ├── subjects/
│   │   ├── notes/
│   │   ├── upload/
│   │   ├── verify/
│   │   └── profile/
│   └── api/                   # REST API routes
├── components/
│   └── shared/                # Reusable components
├── lib/
│   ├── auth.ts                # JWT utilities
│   ├── prisma.ts              # Prisma client
│   └── utils.ts               # Helpers
└── middleware.ts               # Route protection
```

---

## 🗃️ Data Hierarchy

```
Institution (e.g. IIT Delhi)
  └── Department (e.g. CSE)
        └── Year Group (e.g. 2nd Year)
              └── Subject (e.g. DBMS)
                    └── Topic (e.g. Normalization)
                          └── Notes (PDFs, images, text)
```

---

## 🔒 Roles & Permissions

| Action                    | Student | Teacher | Admin |
|---------------------------|---------|---------|-------|
| View own institution notes | ✅     | ✅      | ✅    |
| Upload notes               | ✅     | ✅      | —     |
| Verify/approve notes       | ❌     | ✅      | ✅    |
| Manage departments         | ❌     | ❌      | ✅    |
| Approve user IDs           | ❌     | ❌      | ✅    |
| Create institutions        | ❌     | ❌      | Super Admin |

---

## 🌐 Deployment to Production

### Environment Variables (update in docker-compose.yml)

```
JWT_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deploy with Docker

```bash
docker-compose up -d --build
```

### Deploy to a VPS (e.g. DigitalOcean, AWS EC2)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Upload project & run
scp -r ./edushare user@yourserver:/app
ssh user@yourserver
cd /app/edushare
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx tsx prisma/seed.ts
```

### Reverse proxy (Nginx example)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📦 Building for Production

```bash
npm run build
npm start
```

---

## 🧩 Extending the Platform

**Add S3 file storage**: Replace local file writes in `api/student/notes/route.ts` with AWS SDK S3 uploads.

**Add email notifications**: Use Nodemailer/Resend to notify users on verification approval.

**Add comments**: The `Comment` model is already in the schema — add a comments section to NoteCard.

**Mobile app**: The REST API is fully built — connect a React Native app to `/api/*` routes.
