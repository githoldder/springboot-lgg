#!/bin/bash
# scripts/deploy.sh

set -e
echo "=========================================="
echo "Deployment Pipeline Started"
echo "=========================================="

echo "1. Building Backend (Maven)..."
cd ruoyi-vue-lgg-backend
mvn clean package -DskipTests
cd ..

echo "2. Building Frontend (Vue)..."
cd ruoyi-vue-lgg-frontend
npm install
npm run build:prod
cd ..

echo "3. Pushing Artifacts to VM (/opt/lgg)..."
orb sudo mkdir -p /opt/lgg/backend
orb sudo mkdir -p /opt/lgg/frontend
orb sudo chown -R $(orb whoami) /opt/lgg

# Push backend jars
for app in ruoyi-admin ruoyi-business ruoyi-gateway ruoyi-pay ruoyi-notice; do
    echo "Pushing $app.jar..."
    orbctl push ruoyi-vue-lgg-backend/$app/target/$app.jar /opt/lgg/backend/
done

# Push frontend dist
echo "Pushing frontend dist..."
# orbctl push on a directory works recursively
orbctl push ruoyi-vue-lgg-frontend/dist /opt/lgg/frontend/

echo "4. Pushing Configurations..."
if [ -f "infrastructure/pm2/ecosystem.config.cjs" ]; then
    echo "Pushing ecosystem.config.cjs..."
    orbctl push infrastructure/pm2/ecosystem.config.cjs /opt/lgg/
fi

if [ -f "infrastructure/nginx/nginx.conf" ]; then
    echo "Pushing nginx.conf..."
    orbctl push infrastructure/nginx/nginx.conf /tmp/nginx.conf
    orb sudo mv /tmp/nginx.conf /etc/nginx/sites-available/default
    orb sudo nginx -t
    orb sudo systemctl reload nginx
fi

echo "5. Restarting PM2 Services..."
orb bash -c "cd /opt/lgg && (pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs)"
orb bash -c "pm2 save"

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
