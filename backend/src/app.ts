import express from 'express';
import { env } from './config/env.js'; // Используем .js в импортах, если настроен NodeNext
import apiRoutes from './routes/api.routes.js';

const app = express();

// Настраиваем Middlewares
app.use(express.json()); // Для парсинга JSON-body в запросах

app.use('/api', apiRoutes);

// Тестовый роут для проверки работоспособности API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Запуск сервера на порту из конфигурации env
app.listen(env.PORT, () => {
  console.log(`🚀 Сервер бэкенда запущен в режиме [${env.NODE_ENV}] на порту ${env.PORT}`);
});

export default app;