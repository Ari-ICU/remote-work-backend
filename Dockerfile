FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN mkdir -p public/uploads

# Set environment variables to help with Prisma binary downloads
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=true

RUN npx prisma generate

RUN npm run build

EXPOSE 10000

# Generate Prisma client and start the app in production mode
CMD npx prisma generate && npm run start:prod
