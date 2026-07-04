import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client = new Resend(process.env.RESEND_API_KEY);
  private readonly from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    const { error } = await this.client.emails.send({
      from: this.from,
      to,
      subject: 'Redefinição de senha — agenda.ai',
      html: `
        <p>Recebemos uma solicitação para redefinir sua senha no agenda.ai.</p>
        <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a></p>
        <p>Se você não solicitou isso, pode ignorar este e-mail. O link expira em 1 hora.</p>
      `,
    });

    if (error) {
      this.logger.error(`Falha ao enviar e-mail de redefinição para ${to}: ${JSON.stringify(error)}`);
    }
  }
}
