import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export interface TransportBaseConfig {
    auth: {
        user: string,
        pass: string
    }
}

export interface TransportServiceConfig extends TransportBaseConfig {
    service: string
}

export interface TransportHostConfig extends TransportBaseConfig {
    host: string,
    port: number,
    secure: boolean
}

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Инициализируем транспорт с настройками из нашего .env
    const transportBaseConfig: TransportBaseConfig = {
         auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
         }
    }
    const transportConfig: TransportHostConfig | TransportServiceConfig = env.SMTP_SERVICE 
        ? ({
            service: env.SMTP_SERVICE,
            ...transportBaseConfig
        }as TransportServiceConfig)
        : ({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            ...transportBaseConfig
        }as TransportHostConfig)

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  /**
   * Метод отправки уведомления на почту владельца лендинга
   * @param data Данные формы от клиента
   */
  public async sendContactNotification(data: { name: string; email: string; phone?: string; comment: string }): Promise<void> {
    const htmlLayout = `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Новая заявка с лендинга</h2>
        
        <p><strong>Имя клиента:</strong> ${data.name}</p>
        <p><strong>Email для связи:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Телефон:</strong> ${data.phone || 'Не указан'}</p>
        
        <div style="margin-top: 20px; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p style="margin-top: 0; font-weight: bold; color: #334155;">Комментарий:</p>
          <p style="white-space: pre-wrap; color: #475569; margin-bottom: 0;">${data.comment}</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <small style="color: #94a3b8;">Письмо сгенерировано автоматически бэкендом приложения.</small>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.SMTP_USER,
      to: env.MAIL_TO,
      cc: data.email,
      subject: `🔥 Новая заявка от ${data.name}`, 
      html: htmlLayout,
    });
  }
}
