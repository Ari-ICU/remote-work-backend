FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN mkdir -p public/uploads
RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
