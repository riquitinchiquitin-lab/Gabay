# Use Node.js base image
FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Postgress client
RUN npx prisma generate --schema=postgress/schema.postgress

# Build frontend
RUN npm run build

# Production image
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/dist ./dist
COPY --from=base /app/postgress ./postgress
COPY --from=base /app/server.ts ./server.ts
COPY --from=base /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
ENV NODE_ENV=production

# Re-run prisma generate in runner if needed, or just copy generated artifacts
CMD ["npm", "start"]
