FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
COPY apps/server/package.json ./apps/server/package.json
RUN npm install --workspace=apps/server

COPY apps/server ./apps/server
RUN npm run build --workspace=apps/server

EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]
