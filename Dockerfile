FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .  
COPY tsconfig.json .
COPY migrations migrations

COPY . .

RUN npm install

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/.env .env
COPY --from=builder /app/migrations ./migrations

EXPOSE 3000

CMD sh -c "node dist/src/main.js"