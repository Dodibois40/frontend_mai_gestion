# Dockerfile pour Railway
FROM node:20-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json
COPY backend/package*.json ./

# Copier les fichiers Prisma AVANT npm install
COPY backend/prisma ./prisma

# Installer les dépendances (npm install va maintenant trouver prisma/schema.prisma)
RUN npm install

# Copier le reste du code source
COPY backend/ ./

# Compiler TypeScript
RUN npm run build

# Exposer le port
EXPOSE 8000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=8000

# Commande de démarrage
CMD ["npm", "start"]
