import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  SMTP_SERVICE?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  MAIL_TO: string;
  OPENAI_API_KEY: string;
  OPENAI_API_URL?: string;
  OPENAI_API_MODEL: string;
}

function validateEnv(): EnvConfig {
  const requiredFields: Array<keyof EnvConfig> = [
    'PORT',
    'NODE_ENV',
    'SMTP_USER',
    'SMTP_PASS',
    'MAIL_TO',
    'OPENAI_API_KEY',
    'OPENAI_API_URL',
    'OPENAI_API_MODEL'
  ];

  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    if (!process.env[field]) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(
      `❌ Критическая ошибка конфигурации: Отсутствуют обязательные переменные окружения в .env: [ ${missingFields.join(', ')} ]`
    );
  }

  // Проверяем корректность числовых значений
  const port = Number(process.env.PORT);
  const smtpService = process.env.SMTP_SERVICE;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT);

  if (!smtpService && (!smtpHost || !smtpPort)) {
    throw new Error(`❌ Критическая ошибка конфигурации почты: Укажите либо SMTP_SERVICE, либо связку SMTP_HOST и SMTP_PORT`);
  }
  if (isNaN(port)) {
    throw new Error('❌ Переменная PORT должна быть числом');
  }
  if (isNaN(smtpPort)) {
    throw new Error('❌ Переменная SMTP_PORT должна быть числом');
  }

  // Возвращаем строго типизированный объект
  return {
    PORT: port,
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    SMTP_SERVICE: smtpService,
    SMTP_HOST: smtpHost,
    SMTP_PORT: smtpPort,
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    MAIL_TO: process.env.MAIL_TO!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_API_URL: process.env.OPENAI_API_URL,
    OPENAI_API_MODEL: process.env.OPENAI_API_MODEL!
  };
}

// Экспортируем уже провалидированный конфиг
export const env = validateEnv();
