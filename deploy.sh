#!/bin/bash
set -e

echo "🚀 EduShare Deployment Script"
echo "================================"

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Install it from https://docs.docker.com/get-docker/"
  exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose not found."
  exit 1
fi

# Create .env if missing
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  # Generate a random JWT secret
  JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "please-change-this-secret-to-something-secure-32chars")
  sed -i "s/your-super-secret-jwt-key-change-in-production-min-32-chars/$JWT_SECRET/" .env
  echo "✅ .env created with auto-generated JWT secret"
fi

# Create uploads directory
mkdir -p public/uploads/notes public/uploads/id-cards
echo "✅ Upload directories created"

# Build & start
echo "🐳 Starting Docker containers..."
docker-compose up -d --build

# Wait for DB
echo "⏳ Waiting for database to be ready..."
sleep 8

# Run migrations
echo "🗃️ Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy 2>/dev/null || \
  docker-compose exec -T app npx prisma db push

# Seed
echo "🌱 Seeding database with demo data..."
docker-compose exec -T app npx tsx prisma/seed.ts

echo ""
echo "✅ EduShare is running!"
echo ""
echo "🌐 URL: http://localhost:3000"
echo ""
echo "📋 Demo Accounts:"
echo "  Super Admin: superadmin@edushare.com / superadmin123"
echo "  Admin:       admin@iitd.ac.in / admin123"
echo "  Teacher:     prof.sharma@iitd.ac.in / teacher123"
echo "  Student:     student@iitd.ac.in / student123"
echo ""
echo "🛑 To stop:  docker-compose down"
echo "📜 Logs:     docker-compose logs -f app"
