#!/bin/bash

echo "🚀 Starting MERN Todo Deployment..."

# -------------------------------
# 1. System setup
# -------------------------------
sudo apt update -y
sudo apt install nginx git curl -y

# -------------------------------
# 2. Install NVM + Node 20
# -------------------------------
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

export NVM_DIR="$HOME/.nvm"
\. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
nvm alias default 20

# -------------------------------
# 3. Install PM2
# -------------------------------
npm install -g pm2

# -------------------------------
# 4. Fix RAM (safe for EC2)
# -------------------------------
sudo fallocate -l 1G /swapfile || true
sudo chmod 600 /swapfile
sudo mkswap /swapfile || true
sudo swapon /swapfile || true

# -------------------------------
# 5. Clone Project
# -------------------------------
cd ~
rm -rf CC-todo
git clone https://github.com/adityabhalgat/CC-todo.git
cd CC-todo

# -------------------------------
# 6. Backend Setup
# -------------------------------
cd backend

npm install

# Create backend .env
cat <<EOT > .env
PORT=5006
MONGODB_URI=mongodb+srv://123456789:123456789_987654321@studentrecords.o1opu8e.mongodb.net/
FRONTEND_URL=http://$(curl -s ifconfig.me)
EOT

# Start backend
pm2 delete all
pm2 start src/server.js --name todo-backend
pm2 save

# -------------------------------
# 7. Frontend Setup
# -------------------------------
cd ../frontend

npm install

# Create frontend .env
cat <<EOT > .env
VITE_API_URL=/api
EOT

# Build frontend
npm run build

# -------------------------------
# 8. Deploy frontend
# -------------------------------
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# -------------------------------
# 9. Nginx Config (FINAL CORRECT)
# -------------------------------
sudo bash -c 'cat > /etc/nginx/sites-available/default' <<EOT
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    # API proxy (NO rewrite)
    location /api {
        proxy_pass http://localhost:5006;
    }
}
EOT

# Restart nginx
sudo systemctl restart nginx

# -------------------------------
# DONE
# -------------------------------
echo "✅ Deployment Complete!"
echo "🌐 Open: http://$(curl -s ifconfig.me)"
echo "⚠️ Run: pm2 startup → copy command → then pm2 save"
