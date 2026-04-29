# Use Node.js base image
FROM node:22-slim AS base

# Install openssl (still useful for many things)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Production image
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/dist ./dist
COPY --from=base /app/server.ts ./server.ts
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/.env.example ./.env.example

EXPOSE 3000
ENV NODE_ENV=production

# Re-run prisma generate in runner if needed, or just copy generated artifacts
CMD ["npm", "start"]
