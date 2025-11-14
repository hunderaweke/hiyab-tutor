# Hiyab Tutor - Complete Tutoring Platform

A full-stack tutoring platform with Go backend, React frontend and admin dashboard.

## 🏗️ Project Structure

```
hiyab-tutor/
├── backend/          # Go API (Gin + GORM + PostgreSQL)
├── frontend/         # React public website
├── dashboard/        # React admin panel
├── deploy.sh         # Main deployment script
├── backup.sh         # Backup script
├── restore.sh        # Restore script
├── manage.sh         # Management console
└── docker-compose.prod.yml
```

## 🚀 Quick Start

### Development

```bash
# Backend
cd backend
make docker-run    # Start PostgreSQL
make run          # Run backend

# Frontend
cd frontend
npm install
npm run dev       # Runs on port 4000

# Dashboard
cd dashboard
npm install
npm run dev       # Runs on port 3000
```

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

Quick deployment:

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Configure your settings

# 2. Deploy
chmod +x deploy.sh
./deploy.sh
```

## 📦 Services

| Service     | Port | Description                   |
| ----------- | ---- | ----------------------------- |
| Backend API | 8080 | Go REST API with Swagger docs |
| Frontend    | 80   | Public website                |
| Dashboard   | 3000 | Admin panel                   |
| PostgreSQL  | 5432 | Database                      |

## 🛠️ Management Scripts

- `./deploy.sh` - Full deployment automation
- `./backup.sh` - Create backups
- `./restore.sh` - Restore from backups
- `./manage.sh` - Interactive management console

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- [Backend README](backend/README.md) - Backend development guide
- API Documentation: http://localhost:8080/swagger/index.html

## 🔧 Tech Stack

**Backend:**

- Go 1.24
- Gin Web Framework
- GORM (PostgreSQL)
- JWT Authentication
- Swagger/OpenAPI

**Frontend:**

- React 19
- Vite
- TailwindCSS
- Axios

**Dashboard:**

- React 19
- TypeScript
- Vite
- TailwindCSS
- Radix UI

**Infrastructure:**

- Docker & Docker Compose
- Nginx
- PostgreSQL 16

## 📝 License

[Your License]
