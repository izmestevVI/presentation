# Stage 1: Сборка статики Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Раздача статики через Nginx
FROM nginx:stable-alpine AS runner
# Копируем собранный фронтенд в дефолтную папку Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Опционально: если на проде будет SPA-роутинг, можно подкинуть свой конфиг Nginx.
# Но для нашей одностраничной формы дефолтного конфига хватит за глаза.

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]