import { Router } from 'express';
import { FormController } from '../controllers/form.controller.js';

const router = Router();
const formController = new FormController();

// Маршрут для обработки отправки контактной формы
// POST /api/contact
router.post('/contact', formController.handleContactSubmit);

// Маршрут для улучшения текста с помощью ИИ (AI Улучшайзер)
// POST /api/contact/improve
router.post('/contact/improve', formController.handleTextImprove);

export default router;