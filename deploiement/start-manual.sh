#!/bin/bash
cd /home/cexe9174/nodejs_apps/mai-gestion-api
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="mysql://cexe9174_mai_user:Do@66001699@localhost:3306/cexe9174_mai_gestion"
export JWT_SECRET="xK9mP3nQ7rT5vY2bC4dF6gH8jL1aS0wE"
export FRONTEND_URL="https://crm.lamanufacturedubois.com"
export API_URL="https://api.lamanufacturedubois.com"
export FIREBASE_API_KEY="AIzaSyBePps0LFOBvqQFB9fwB_G-2paIlvCQQFs"

# Démarrer l'application
node dist/main.js 