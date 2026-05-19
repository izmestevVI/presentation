import OpenAI from 'openai';
import { env } from '../config/env.js';

type OpenCodeErrorResponse = {
    error?: {
        message?: string;
    };
};
interface OpenCodeChatResponse {
    choices: Array<{
        message?: {
            content?: string;
        };
    }>;
}

export class AIService {
    private apiKey: string;
    private apiUrl: string | undefined;
    private apiModel: string;

    constructor() {
        this.apiKey = env.OPENAI_API_KEY;
        this.apiUrl = env.OPENAI_API_URL;
        this.apiModel = env.OPENAI_API_MODEL;
    }

    /**
     * Улучшает текст комментария пользователя (AI Улучшайзер)
     * @param text Исходный текст от пользователя
     */
    public async improveText(text: string): Promise<string> {
        if (!text || text.trim().length === 0) {
            throw new Error('Текст для улучшения не может быть пустым');
        }

        try {
            const client = new OpenAI({
                baseURL: this.apiUrl,
                apiKey: this.apiKey,
            });

            const response = await client.responses.create({
                model: this.apiModel,
                instructions: 'Вы — профессиональный редактор текста. Ваша задача — улучшить отзыв или комментарий пользователя. Исправьте грамматические, орфографические и пунктуационные ошибки. Сделайте текст более понятным, улучшите его тон и структуру, строго сохраняя при этом исходный смысл, намерение и язык пользователя. Не добавляйте никаких вводных фраз, приветствий или комментариев от себя. Выведите ТОЛЬКО улучшенный текст.',
                input: text,
            });

            if (response.error) {
                throw new Error(response.error.message || `Произошла ошибка в работе AI асистента`);
            }

            return response.output_text

        } catch (error: any) {
            console.error('❌ Ошибка в AIService.improveText:', error.message);
            throw new Error(`Не удалось улучшить текст через AI. Попробуйте позже.`);
        }
    }
}