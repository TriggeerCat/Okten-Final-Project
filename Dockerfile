FROM node:22-alpine

WORKDIR /app

COPY ./app/package.json ./app/package-lock.json ./
RUN npm ci

COPY ./app .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/main.js"]
