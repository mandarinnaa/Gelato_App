#!/bin/bash

# Exit on error
set -e

# Run standard Laravel commands
echo "🚀 Running deployment tasks..."
php artisan storage:link
php artisan migrate --force

# Replace PORT in nginx.conf
echo "🔧 Configuring Nginx port..."
sed -i "s/PORT/$PORT/g" /app/docker/nginx.conf

# Start Supervisor
echo "👷 Starting Supervisor..."
supervisord -c /app/docker/supervisord.conf
