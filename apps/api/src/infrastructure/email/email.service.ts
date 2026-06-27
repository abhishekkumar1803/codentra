import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  isMockMode(): boolean {
    return (
      this.config.get('RESEND_MOCK', 'true') === 'true' ||
      !this.config.get('RESEND_API_KEY')
    );
  }

  async send(input: SendEmailInput): Promise<void> {
    if (this.isMockMode()) {
      this.logger.log(
        `[MOCK EMAIL] To: ${input.to} | Subject: ${input.subject}`,
      );
      return;
    }

    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get(
      'RESEND_FROM',
      'Codentra <noreply@codentra.dev>',
    );

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Resend API error: ${response.status} ${body}`);
    }
  }

  async sendSubscriptionConfirmation(email: string, name: string) {
    await this.send({
      to: email,
      subject: 'Welcome to Codentra — subscription active',
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Your Codentra membership (₹49/month) is now active.</p>
        <p>Start competing in contests, take quizzes, and climb the leaderboards.</p>
        <p>— The Codentra Team</p>
      `,
    });
  }
}
