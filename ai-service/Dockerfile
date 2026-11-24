FROM node:20-alpine
WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=4000
EXPOSE 4000
USER node
CMD ["node", "server.js"]