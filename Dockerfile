# === Шаг 1: Сборка фронтенда ===
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# === Шаг 2: Сборка бэкенда ===
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# === Шаг 3: Финальный образ для Amvera ===
FROM hoosin/alpine-nginx-nodejs:latest

WORKDIR /app

# Копируем скомпилированный бэкенд и ставим только prod-зависимости
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm ci --only=production

# Копируем фронтенд в папку Nginx (внутри этого образа)
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Копируем твой кастомный nginx.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Автоматически меняем хост "backend" на локальный "127.0.0.1", 
# так как теперь всё живет внутри одного процесса
RUN sed -i 's/http:\/\/backend:5000/http:\/\/127.0.0.1:5000/g' /etc/nginx/conf.d/default.conf

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 80

# Команда запуска: этот образ по умолчанию запускает Nginx сам (как демон),
# поэтому нам достаточно просто запустить наш Node.js бэкенд в качестве основной команды
# CMD ["node", "dist/app.js"]
# CMD node dist/app.js & nginx -g "daemon off;"
CMD PORT=$BACKEND_PORT node dist/app.js & nginx -g "daemon off;"