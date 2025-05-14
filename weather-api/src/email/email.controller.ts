import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('test-email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async testEmail(@Query('email') email: string): Promise<{ message: string }> {
    if (!email) {
      return { message: 'Please provide an email query parameter' };
    }

    try {
      await this.emailService.sendConfirmationEmail(
        email,
        'Test City',
        'daily',
        'test-token-123',
      );
      return {
        message: 'Test email sent successfully! Check your inbox or Mailtrap.',
      };
    } catch (error) {
      return { message: `Failed to send test email: ${error.message}` };
    }
  }
}
