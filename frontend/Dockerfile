FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

# Run as a non-root user (security: least privilege).
RUN addgroup -S appuser && adduser -S -G appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

CMD ["npm", "start"]
