#!/bin/bash
# init-ssl.sh - Helper script to initialize SSL certificate via Certbot or create dummy certs
set -e

DOMAIN=${DOMAIN:-api.yourdomain.com}
EMAIL=${EMAIL:-admin@yourdomain.com}
STAGING=${STAGING:-0} # Set to 1 for Let's Encrypt staging/dry-run

DATA_PATH="./certbot"
if [ ! -e "$DATA_PATH/conf/live/production/fullchain.pem" ]; then
  echo "### Creating dummy certificate for $DOMAIN ..."
  mkdir -p "$DATA_PATH/conf/live/production"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$DATA_PATH/conf/live/production/privkey.pem" \
    -out "$DATA_PATH/conf/live/production/fullchain.pem" \
    -subj "/CN=localhost"
fi

echo "### Starting nginx ..."
docker compose -f docker-compose.prod.yml up --force-recreate -d nginx

echo "### Requesting Let's Encrypt certificate for $DOMAIN ..."
STAGING_ARG=""
if [ "$STAGING" != "0" ]; then
  STAGING_ARG="--staging"
fi

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot

echo "### Reloading nginx ..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
