FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund --legacy-peer-deps || yarn install || true

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]


