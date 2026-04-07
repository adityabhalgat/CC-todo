# MERN Task Management System (EC2 Deployment Guide)

This project is a MERN-based task management application where users can create, update, and delete tasks.

The guide below explains how to deploy the full stack on an AWS EC2 Ubuntu machine, with MongoDB Atlas as the hosted database.

## Features

- Create tasks with title, description, and status
- Read/list tasks from MongoDB
- Update tasks
- Delete tasks
- React frontend connected to Express REST API

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express + Mongoose
- Database: MongoDB Atlas (cloud hosted)
- Deployment host: AWS EC2 (Ubuntu)
- Process manager: PM2
- Web server/reverse proxy: Nginx

## Project Structure

```text
Student Records/
  backend/
    src/
      config/
      models/
      routes/
      server.js
  frontend/
    src/
      App.jsx
      main.jsx
      styles.css
  README.md
```

## API Endpoints

Base URL: /api/tasks

- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

Health endpoint: /api/health

## 1. Prerequisites

Before deployment, ensure you have:

- AWS account
- EC2 instance (Ubuntu 22.04 recommended)
- A domain name (recommended for production)
- MongoDB Atlas cluster and connection URI
- Project code pushed to GitHub

## 2. Launch and Prepare EC2

## 2.1 Create EC2 instance

1. Launch Ubuntu EC2 (t2.micro for testing is fine).
2. Allow inbound security group rules:
   - SSH: 22 (your IP only)
   - HTTP: 80 (0.0.0.0/0)
   - HTTPS: 443 (0.0.0.0/0)

## 2.2 Connect to EC2

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## 2.3 Install required software

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2
```

Verify:

```bash
node -v
npm -v
pm2 -v
nginx -v
```

## 3. MongoDB Atlas Setup

1. Create cluster in MongoDB Atlas.
2. Create DB user with username/password.
3. In Network Access:
   - For quick testing, allow 0.0.0.0/0
   - For better security, allow only EC2 public IP
4. Copy connection string:

```text
mongodb+srv://<username>:<password>@<cluster-url>/<dbName>?retryWrites=true&w=majority
```

## 4. Clone and Configure Project on EC2

## 4.1 Clone repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

## 4.2 Backend environment setup

```bash
cd backend
cp .env.example .env
nano .env
```

Set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbName>?retryWrites=true&w=majority
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
```

Install backend dependencies:

```bash
npm install
```

## 4.3 Frontend environment setup

```bash
cd ../frontend
cp .env.example .env
nano .env
```

Set:

```env
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP/api
```

Install and build frontend:

```bash
npm install
npm run build
```

## 5. Run Backend with PM2

From project root:

```bash
cd backend
pm2 start src/server.js --name task-manager-api
pm2 save
pm2 startup
```

Check logs/status:

```bash
pm2 list
pm2 logs task-manager-api
```

Test API from EC2:

```bash
curl http://localhost:5000/api/health
```

## 6. Configure Nginx (Frontend + API Reverse Proxy)

Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/task-manager
```

Paste:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_EC2_IP;

    root /home/ubuntu/<your-repo>/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Now open:

```text
http://YOUR_EC2_PUBLIC_IP
```

## 7. Optional: Enable HTTPS with Let's Encrypt

If domain is mapped to EC2 public IP:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renew test:

```bash
sudo certbot renew --dry-run
```

Then update backend CORS value in backend/.env:

```env
FRONTEND_URL=https://yourdomain.com
```

Restart backend:

```bash
pm2 restart task-manager-api
```

## 8. Update Workflow After Code Changes

After pushing new code:

```bash
cd /home/ubuntu/<your-repo>
git pull origin main

cd backend
npm install
pm2 restart task-manager-api

cd ../frontend
npm install
npm run build

sudo systemctl reload nginx
```

## 9. Verification Checklist

- App loads from EC2 public URL/domain
- Create task works
- Update task works
- Delete task works
- No CORS errors in browser console
- /api/health returns success
- Tasks are stored in MongoDB Atlas

## 10. Common Troubleshooting

1. 502 Bad Gateway in browser
   - Check PM2 status/logs
   - Ensure backend is listening on PORT=5000

2. CORS error in browser
   - Ensure FRONTEND_URL in backend/.env exactly matches frontend URL
   - Restart PM2 after changing .env

3. MongoDB connection error
   - Verify MONGODB_URI format
   - Confirm Atlas user/password
   - Confirm Atlas Network Access includes EC2 IP

4. Frontend routing gives 404 on refresh
   - Confirm Nginx has: try_files $uri $uri/ /index.html;

## 11. Security Notes (Recommended)

- Do not commit real secrets in .env files
- Restrict SSH rule (port 22) to your IP only
- Prefer domain + HTTPS over raw public IP
- Use Atlas IP allow-list restrictions instead of 0.0.0.0/0 in production
