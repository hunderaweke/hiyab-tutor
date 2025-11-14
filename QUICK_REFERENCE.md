# Quick Reference Guide - Hiyab Tutor Deployment

## 🎯 One-Line Commands

### Initial Setup on VPS

```bash
# Setup VPS (run as root)
curl -fsSL https://raw.githubusercontent.com/yourusername/hiyab-tutor/main/setup-vps.sh | sudo bash

# Clone and deploy
cd /opt/hiyab-tutor && git clone <repo-url> . && cp .env.example .env && nano .env && chmod +x *.sh && ./deploy.sh
```

### Daily Operations

```bash
# View status
docker compose -f docker-compose.prod.yml ps

# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Restart everything
docker compose -f docker-compose.prod.yml restart

# Stop everything
docker compose -f docker-compose.prod.yml down

# Start everything
docker compose -f docker-compose.prod.yml up -d
```

### Specific Services

```bash
# Backend only
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml logs -f backend

# Frontend only
docker compose -f docker-compose.prod.yml restart frontend
docker compose -f docker-compose.prod.yml logs -f frontend

# Dashboard only
docker compose -f docker-compose.prod.yml restart dashboard
docker compose -f docker-compose.prod.yml logs -f dashboard

# Database only
docker compose -f docker-compose.prod.yml restart postgres
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Backup & Restore

```bash
# Create backup
./backup.sh

# Restore from backup
./restore.sh

# Manual database backup
docker exec hiyab-postgres pg_dump -U postgres hiyab_tutor > backup.sql

# Manual database restore
cat backup.sql | docker exec -i hiyab-postgres psql -U postgres -d hiyab_tutor
```

### Database Operations

```bash
# Access PostgreSQL console
docker exec -it hiyab-postgres psql -U postgres -d hiyab_tutor

# Run SQL query
docker exec hiyab-postgres psql -U postgres -d hiyab_tutor -c "SELECT * FROM users;"

# Check database size
docker exec hiyab-postgres psql -U postgres -d hiyab_tutor -c "SELECT pg_size_pretty(pg_database_size('hiyab_tutor'));"
```

### Monitoring

```bash
# Resource usage
docker stats

# Disk usage
docker system df

# Service health
curl http://localhost:8080/api/v1/health
```

### Updates

```bash
# Pull and redeploy
git pull && ./deploy.sh

# Manual rebuild
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Cleanup

```bash
# Remove old images
docker image prune -f

# Remove everything unused
docker system prune -a

# Remove specific image
docker rmi hiyab-backend:latest
```

## 📁 Important Files

| File                      | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `.env`                    | Environment configuration (DO NOT COMMIT) |
| `deploy.sh`               | Main deployment script                    |
| `backup.sh`               | Backup automation                         |
| `restore.sh`              | Restore from backup                       |
| `manage.sh`               | Interactive management menu               |
| `setup-vps.sh`            | VPS initial setup                         |
| `docker-compose.prod.yml` | Production orchestration                  |
| `DEPLOYMENT.md`           | Full deployment guide                     |

## 🔌 Default Ports

| Service     | Port | URL                                      |
| ----------- | ---- | ---------------------------------------- |
| Frontend    | 80   | http://localhost                         |
| Dashboard   | 3000 | http://localhost:3000                    |
| Backend API | 8080 | http://localhost:8080                    |
| API Docs    | 8080 | http://localhost:8080/swagger/index.html |
| PostgreSQL  | 5432 | localhost:5432                           |

## 🔑 Environment Variables (Required)

```bash
JWT_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
BLUEPRINT_DB_PASSWORD=db-password
WEB_APP_URL=http://yourdomain.com
```

Generate secrets:

```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For passwords
```

## 🚨 Troubleshooting

### Services won't start

```bash
docker compose -f docker-compose.prod.yml logs
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Database connection failed

```bash
docker compose -f docker-compose.prod.yml restart postgres
docker exec hiyab-postgres pg_isready -U postgres
```

### Backend API errors

```bash
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml restart backend
```

### Port already in use

```bash
# Find process using port 8080
sudo lsof -i :8080
sudo netstat -tulpn | grep 8080

# Kill process
sudo kill -9 <PID>
```

### Out of disk space

```bash
# Check space
df -h

# Clean Docker
docker system prune -a --volumes

# Clean old backups
find backups/ -mtime +30 -delete
```

## 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Configure firewall (UFW)
- [ ] Set up SSL/TLS certificates
- [ ] Secure `.env` file (chmod 600)
- [ ] Regular backups enabled
- [ ] Keep system updated
- [ ] Monitor logs regularly
- [ ] Limit database external access

## 📞 Quick Help

```bash
# Show all available commands
./manage.sh

# Deployment help
./deploy.sh --help

# View service status
docker compose -f docker-compose.prod.yml ps

# Interactive management
./manage.sh
```

## 🔄 Common Workflows

### Complete Redeploy

```bash
./backup.sh
git pull
./deploy.sh
```

### Update Just Backend

```bash
cd backend
docker compose -f ../docker-compose.prod.yml build backend
docker compose -f ../docker-compose.prod.yml up -d backend
```

### Database Maintenance

```bash
# Backup
./backup.sh

# Access console
docker exec -it hiyab-postgres psql -U postgres -d hiyab_tutor

# Vacuum (optimize)
docker exec hiyab-postgres psql -U postgres -d hiyab_tutor -c "VACUUM ANALYZE;"
```

### Log Analysis

```bash
# Errors only
docker compose -f docker-compose.prod.yml logs | grep -i error

# Last hour
docker compose -f docker-compose.prod.yml logs --since 1h

# Specific time range
docker compose -f docker-compose.prod.yml logs --since 2024-11-14T10:00:00
```
