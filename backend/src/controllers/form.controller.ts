import { Request, Response } from 'express';
import { MailService } from '../services/mail.service.js';
import { AIService } from '../services/ai.service.js';

export class FormController {
  private mailService: MailService;
  private aiService: AIService;

  constructor() {
    this.mailService = new MailService();
    this.aiService = new AIService();
  }

  /**
   * Обработка отправки контактной формы
   * POST /api/contact
   */
  public handleContactSubmit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, phone, comment } = req.body;

      // 1. Валидация обязательных полей на стороне сервера (безопасность превыше всего)
      if (!name || !email || !comment) {
        res.status(400).json({ 
          error: 'Пожалуйста, заполните все обязательные поля: Имя, Email и Комментарий.' 
        });
        return;
      }

      // 2. Отправляем уведомление на почту через MailService
      await this.mailService.sendContactNotification({ name, email, phone, comment });

      // 4. Возвращаем успешный ответ фронтенду
      res.status(200).json({ 
        success: true, 
        message: 'Заявка успешно принята! Письмо отправлено.' 
      });

    } catch (error: any) {
      console.error('❌ Ошибка в FormController.handleContactSubmit:', error.message);
      res.status(500).json({ 
        error: 'Внутренняя ошибка сервера при обработке формы. Попробуйте позже.' 
      });
    }
  };

  /**
   * Обработка улучшения текста (AI Улучшайзер)
   * POST /api/contact/improve
   */
  public handleTextImprove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        res.status(400).json({ error: 'Текст для улучшения не может быть пустым.' });
        return;
      }

      // Вызываем метод улучшения текста из AIService
      const improvedText = await this.aiService.improveText(text);

      res.status(200).json({ 
        success: true, 
        improvedText 
      });

    } catch (error: any) {
      console.error('❌ Ошибка в FormController.handleTextImprove:', error.message);
      const statusCode = error.status || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Не удалось улучшить текст с помощью AI.' 
      });
    }
  };
}