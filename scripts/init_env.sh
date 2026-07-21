#!/bin/bash
# scripts/init_env.sh
# Run this on macOS. It uses orb CLI to initialize the Ubuntu VM.

set -e

echo "=========================================="
echo "OrbStack VM Environment Initialization"
echo "=========================================="

# Update apt
echo "-> Updating apt packages..."
orb sudo apt-get update

# Install Java 17
echo "-> Installing OpenJDK 17..."
orb sudo apt-get install -y openjdk-17-jdk

# Install Nginx
echo "-> Installing Nginx..."
orb sudo apt-get install -y nginx
orb sudo systemctl enable nginx
orb sudo systemctl start nginx

# Install MySQL Server
echo "-> Installing MySQL Server..."
orb sudo apt-get install -y mysql-server
orb sudo systemctl enable mysql
orb sudo systemctl start mysql

# Install Redis
echo "-> Installing Redis..."
orb sudo apt-get install -y redis-server
orb sudo systemctl enable redis-server
orb sudo systemctl start redis-server

# Install Node.js (v20)
echo "-> Installing Node.js..."
orb curl -fsSL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
orb sudo bash /tmp/nodesource_setup.sh
orb sudo apt-get install -y nodejs

# Install PM2 globally
echo "-> Installing PM2..."
orb sudo npm install -g pm2

# Create application directory
echo "-> Creating application directory /opt/lgg..."
orb sudo mkdir -p /opt/lgg
orb sudo bash -c 'chown -R $(whoami):$(whoami) /opt/lgg'
orb sudo chmod -R 775 /opt/lgg

echo "=========================================="
echo "Initialization Complete!"
echo "Please verify versions:"
orb java -version
orb nginx -v
orb mysql -V
orb node -v
orb pm2 -v
echo "=========================================="
