FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run prisma:generate && npm run build
EXPOSE 4000
CMD ["node", "dist/index.js"]
