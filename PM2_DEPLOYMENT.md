# PM2 Deployment Guide - Hiyab Tutor

## Overview

This guide covers deploying the Hiyab Tutor platform using **PM2** (Process Manager 2) for process management instead of Docker. This approach gives you more control and is ideal for VPS deployments.

---

## 🚀 Quick Start

### Option A: Automated VPS Setup (Recommended for Fresh Server)

If you have a fresh VPS, use our automated setup script that installs everything:

```bash
# Download the setup script
wget https://raw.githubusercontent.com/hunderaweke/hiyab-tutor/main/setup-vps-pm2.sh

# Make it executable
chmod +x setup-vps-pm2.sh

# Run with sudo
sudo ./setup-vps-pm2.sh
```

The script will install:

- ✅ Node.js 22.x LTS (latest) & npm
- ✅ PM2 process manager
- ✅ Go 1.24.0 (latest)
- ✅ PostgreSQL 16
- ✅ Nginx web server
- ✅ System utilities & security (UFW, fail2ban, certbot)

After the script completes, skip to **Step 1** below to clone the repository.

---

### Option B: Manual Setup

If you prefer manual installation or already have some tools installed:

#### Prerequisites

On your VPS, ensure you have:

- **Go** 1.24+ installed
- **Node.js** 22+ and npm
- **PostgreSQL** 16+ running
- **Nginx** (optional, for reverse proxy)
- **Git** for cloning the repository

---

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/hunderaweke/hiyab-tutor.git
cd hiyab-tutor
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**If you used the automated setup script (`setup-vps-pm2.sh`):**

- Database credentials were saved to `/tmp/db_config.txt`
- Copy those values into your `.env` file
- Remember to delete `/tmp/db_config.txt` after copying for security

Required configuration:

```env
JWT_SECRET=your-strong-secret-here
SERVER_PORT=8080
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!

BLUEPRINT_DB_HOST=localhost
BLUEPRINT_DB_PORT=5432
BLUEPRINT_DB_DATABASE=hiyab_tutor
BLUEPRINT_DB_USERNAME=postgres
BLUEPRINT_DB_PASSWORD=YourDBPassword
BLUEPRINT_DB_SCHEMA=public

WEB_APP_URL=http://your-vps-ip
```

### 3. Setup PostgreSQL Database

**If you used the automated setup script:** PostgreSQL is already configured and the database is created. Skip to Step 4.

**Manual setup:**

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE hiyab_tutor;"

# Or if using custom user:
sudo -u postgres psql
CREATE DATABASE hiyab_tutor;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hiyab_tutor TO your_user;
\q
```

### 4. Deploy Everything

```bash
# Make scripts executable
chmod +x deploy-pm2.sh build.sh start.sh stop.sh

# Run complete deployment (builds + starts services)
./deploy-pm2.sh
```

That's it! Your application is now running.

---

## 📁 Project Structure

After deployment, you'll have:

```
hiyab-tutor/
├── backend/
│   ├── bin/
│   │   └── hiyab-api          # Compiled Go binary
│   └── ...
├── frontend/
│   ├── dist/                   # Built React app
│   └── ...
├── dashboard/
│   ├── dist/                   # Built React app
│   └── ...
├── logs/                       # PM2 log files
│   ├── backend-*.log
│   ├── frontend-*.log
│   └── dashboard-*.log
├── ecosystem.config.js         # PM2 configuration
├── build.sh                    # Build all components
├── start.sh                    # Start with PM2
├── stop.sh                     # Stop services
└── deploy-pm2.sh              # Complete deployment
```

---

## 🛠️ Manual Commands

### Building Components

```bash
# Build everything
./build.sh

# Build individual components
./build.sh backend
./build.sh frontend
./build.sh dashboard
```

### Starting Services

```bash
# Start all services
./start.sh

# Or manually with PM2
pm2 start ecosystem.config.js
```

### Stopping Services

```bash
# Stop all services
./stop.sh

# Or manually
pm2 stop ecosystem.config.js
```

### Restarting Services

```bash
# Restart all
pm2 restart ecosystem.config.js

# Restart individual service
pm2 restart hiyab-backend
pm2 restart hiyab-frontend
pm2 restart hiyab-dashboard
```

---

## 📊 PM2 Management

### View Status

```bash
pm2 status
```

### View Logs

```bash
# All logs (live)
pm2 logs

# Specific service
pm2 logs hiyab-backend
pm2 logs hiyab-frontend
pm2 logs hiyab-dashboard

# Last 100 lines
pm2 logs --lines 100
```

### Monitor Resources

```bash
# Interactive monitoring
pm2 monit

# Resource usage
pm2 list
```

### Process Information

```bash
# Detailed info
pm2 show hiyab-backend

# Environment variables
pm2 env 0  # 0 is the process id
```

---

## 🔄 Updates & Redeployment

### Pulling Latest Code

```bash
cd ~/hiyab-tutor
git pull origin main
./deploy-pm2.sh
```

### Rebuild Without Restarting

```bash
# Stop services
pm2 stop ecosystem.config.js

# Rebuild
./build.sh

# Start again
pm2 restart ecosystem.config.js
```

---

## 🌐 Accessing Services

After deployment, services are available at:

| Service   | URL                                | Port |
| --------- | ---------------------------------- | ---- |
| Backend   | `http://your-vps-ip:8080`          | 8080 |
| Frontend  | `http://your-vps-ip:4000`          | 4000 |
| Dashboard | `http://your-vps-ip:3000`          | 3000 |
| Swagger   | `http://your-vps-ip:8080/swagger/` | 8080 |

---

## 🔧 Configuration Details

### PM2 Ecosystem Config (`ecosystem.config.js`)

```javascript
module.exports = {
  apps: [
    {
      name: "hiyab-backend",
      script: "./backend/bin/hiyab-api",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
    },
    {
      name: "hiyab-frontend",
      script: "npx",
      args: "serve -s dist -l 4000",
      cwd: "./frontend",
    },
    {
      name: "hiyab-dashboard",
      script: "npx",
      args: "serve -s dist -l 3000",
      cwd: "./dashboard",
    },
  ],
};
```

### Environment Variables

The backend reads configuration from `.env` file in the repository root:

- `JWT_SECRET` - Secret for JWT tokens
- `SERVER_PORT` - Backend API port (8080)
- `ADMIN_USERNAME/PASSWORD` - Initial admin credentials
- `BLUEPRINT_DB_*` - PostgreSQL connection settings
- `WEB_APP_URL` - Frontend URL for CORS

---

## 🔒 Production Best Practices

### 1. Enable PM2 Startup Script

Start PM2 automatically on system reboot:

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

### 2. Setup Nginx Reverse Proxy

For production, use Nginx to:

- Serve frontend/dashboard on port 80
- Proxy API requests to backend
- Enable HTTPS with SSL

Example Nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:4000;
    }

    # Dashboard
    location /admin {
        proxy_pass http://localhost:3000;
    }

    # API
    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

### 3. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 4. Setup Log Rotation

PM2 includes log rotation by default, but you can customize:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 5. Enable Monitoring

```bash
# PM2 Plus (optional cloud monitoring)
pm2 link <secret> <public>

# Or use pm2 web (free)
pm2 web
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs:**

```bash
pm2 logs hiyab-backend --lines 50
```

**Common issues:**

- Database connection failed → Check PostgreSQL is running and credentials in `.env`
- Port already in use → Check if another process is using port 8080
- Binary not found → Run `./build.sh backend`

### Frontend/Dashboard Not Accessible

**Check if build exists:**

```bash
ls -la frontend/dist
ls -la dashboard/dist
```

**Rebuild if needed:**

```bash
./build.sh frontend
./build.sh dashboard
pm2 restart hiyab-frontend hiyab-dashboard
```

### Database Connection Issues

**Test connection:**

```bash
psql -h localhost -U postgres -d hiyab_tutor -c "SELECT 1;"
```

**Check PostgreSQL status:**

```bash
sudo systemctl status postgresql
```

### Port Conflicts

**Find process using port:**

```bash
sudo lsof -i :8080
sudo lsof -i :3000
sudo lsof -i :4000
```

**Kill process:**

```bash
sudo kill -9 <PID>
```

---

## 📦 Backup & Restore

### Backup Database

```bash
# Create backups directory
mkdir -p ~/backups

# Backup database
pg_dump -U postgres hiyab_tutor > ~/backups/hiyab_$(date +%Y%m%d).sql

# Backup uploads
tar -czf ~/backups/uploads_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Restore Database

```bash
# Restore from backup
psql -U postgres -d hiyab_tutor < ~/backups/hiyab_20251127.sql

# Restore uploads
tar -xzf ~/backups/uploads_20251127.tar.gz -C backend/
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U postgres hiyab_tutor > ~/backups/hiyab_$(date +\%Y\%m\%d).sql
```

---

## 🛠️ VPS Setup Script Details

The `setup-vps-pm2.sh` script automates the entire server setup process. Here's what it does:

### What Gets Installed

1. **System Updates & Utilities**

   - Updates all system packages
   - Installs: curl, wget, git, build-essential, vim, nano, htop, unzip

2. **Node.js & PM2**

   - Node.js 20.x LTS (latest stable)
   - npm (comes with Node.js)
   - PM2 globally installed
   - PM2 startup script configured

3. **Go Programming Language**

   - Go 1.23.3 (or latest stable)
   - Configured in system PATH
   - Added to user's .bashrc

4. **PostgreSQL Database**

   - PostgreSQL 16 (latest)
   - Creates database and user
   - Saves credentials to `/tmp/db_config.txt`
   - Starts and enables service

5. **Nginx Web Server**

   - Latest Nginx from official repos
   - Pre-configured reverse proxy for:
     - Frontend → `http://your-ip/`
     - Dashboard → `http://your-ip/admin`
     - API → `http://your-ip/api`
     - Swagger → `http://your-ip/swagger`
   - Started and enabled

6. **Security & Firewall**
   - UFW firewall enabled
   - Ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - fail2ban for intrusion prevention
   - certbot for SSL/TLS certificates

### Interactive Prompts

The script will ask you for:

- Database name (default: `hiyab_tutor`)
- Database username (default: `postgres`)
- Database password (required)

### Output Files

- `/tmp/db_config.txt` - Contains database credentials (delete after use)

### Running the Script

```bash
# Download
wget https://raw.githubusercontent.com/hunderaweke/hiyab-tutor/main/setup-vps-pm2.sh

# Make executable
chmod +x setup-vps-pm2.sh

# Run as root/sudo
sudo ./setup-vps-pm2.sh
```

**Script execution time:** Approximately 5-10 minutes depending on your server speed.

### After Script Completion

1. Copy database credentials from `/tmp/db_config.txt` to your `.env` file
2. Delete the temporary file: `sudo rm /tmp/db_config.txt`
3. Clone the repository and deploy
4. (Optional) Configure SSL with: `sudo certbot --nginx`

---

## 🔄 Switching from Docker to PM2

If you previously used Docker deployment (from `docker-deployment` branch):

### 1. Stop Docker Containers

```bash
docker compose -f docker-compose.prod.yml down
```

### 2. Switch to Main Branch

```bash
git checkout main
git pull origin main
```

### 3. Deploy with PM2

```bash
./deploy-pm2.sh
```

### Docker vs PM2 Comparison

| Feature          | Docker                | PM2                    |
| ---------------- | --------------------- | ---------------------- |
| Setup Complexity | Medium                | Simple                 |
| Resource Usage   | Higher (containers)   | Lower (native)         |
| Isolation        | Strong                | Process-level          |
| Performance      | Slight overhead       | Native speed           |
| Portability      | Excellent             | OS-dependent           |
| Learning Curve   | Steeper               | Gentler                |
| Best For         | Cloud/K8s deployments | Single VPS deployments |

---

## 📚 Additional Resources

- **PM2 Documentation:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Go Documentation:** https://go.dev/doc/
- **React Documentation:** https://react.dev/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## 🆘 Support

For issues:

1. Check logs: `pm2 logs`
2. Review this guide's troubleshooting section
3. Check `.env` configuration
4. Verify PostgreSQL is running
5. Ensure all ports are available

---

## ✅ Quick Reference Commands

```bash
# Deploy everything
./deploy-pm2.sh

# Build only
./build.sh

# Start services
./start.sh

# Stop services
./stop.sh

# View status
pm2 status

# View logs
pm2 logs

# Restart service
pm2 restart hiyab-backend

# Monitor resources
pm2 monit

# Update application
git pull && ./deploy-pm2.sh
```

---

**Happy Deploying! 🚀**
