FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

# Use npm ci for clean, reliable installs in production
RUN npm ci --legacy-peer-deps

COPY . .

RUN mkdir -p public/uploads

# Set environment variables to help with Prisma binary downloads
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=true
ENV NODE_ENV=production

RUN npx prisma generate

RUN npm run build

# Standard port for NestJS
EXPOSE 3001

# Start the app in production mode with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]


