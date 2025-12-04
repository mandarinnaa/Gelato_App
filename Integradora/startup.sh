#!/bin/bash

composer install --no-interaction --prefer-dist --optimize-autoloader

php artisan migrate --force || true

php artisan config:cache
php artisan route:cache

php artisan serve --host=0.0.0.0 --port=$PORT
