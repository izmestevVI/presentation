# Stage 1: Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Финальный легковесный образ для продакшена
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
# Устанавливаем только prod-зависимости (без typescript, tsx и т.д.)
RUN npm ci --only=production

# Копируем скомпилированный JS из билдера
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/app.js"]