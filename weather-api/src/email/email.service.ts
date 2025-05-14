import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Log the email configuration (obscure the password)
    this.logger.log(
      `Initializing email service with: ${this.configService.get('email.host')}:${this.configService.get('email.port')}, user: ${this.configService.get('email.user')}`,
    );

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: false,
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    });

    // Test the connection
    this.testConnection();
  }

  private async testConnection() {
    try {
      const result = await this.transporter.verify();
      this.logger.log(`Email service connection test result: ${result}`);
    } catch (error) {
      this.logger.error(
        `Email service connection test failed: ${error.message}`,
      );
    }
  }

  async sendConfirmationEmail(
    email: string,
    city: string,
    frequency: string,
    confirmationToken: string,
  ): Promise<void> {
    const confirmUrl = `${this.configService.get('app.url')}/api/confirm/${confirmationToken}`;

    try {
      this.logger.log(
        `Attempting to send confirmation email to ${email} for ${city}`,
      );

      const result = await this.transporter.sendMail({
        from: this.configService.get('email.from'),
        to: email,
        subject: 'Confirm your weather subscription',
        html: `
          <h1>Confirm your subscription to weather updates</h1>
          <p>You've requested to receive ${frequency} weather updates for ${city}.</p>
          <p>Please click the link below to confirm your subscription:</p>
          <a href="${confirmUrl}">${confirmUrl}</a>
          <p>If you didn't request this subscription, you can ignore this email.</p>
        `,
      });

      this.logger.log(
        `Confirmation email sent to ${email}, messageId: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to ${email}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendWeatherUpdate(
    email: string,
    city: string,
    temperature: number,
    humidity: number,
    description: string,
    unsubscribeToken: string | null,
  ): Promise<void> {
    const unsubscribeUrl = unsubscribeToken
      ? `${this.configService.get('app.url')}/api/unsubscribe/${unsubscribeToken}`
      : '#';

    try {
      this.logger.log(
        `Attempting to send weather update to ${email} for ${city}`,
      );

      const result = await this.transporter.sendMail({
        from: this.configService.get('email.from'),
        to: email,
        subject: `Weather Update for ${city}`,
        html: `
          <h1>Weather Update for ${city}</h1>
          <div>
            <p><strong>Temperature:</strong> ${temperature}°C</p>
            <p><strong>Humidity:</strong> ${humidity}%</p>
            <p><strong>Description:</strong> ${description}</p>
          </div>
          <p>You're receiving this email because you subscribed to weather updates for ${city}.</p>
          <p>To unsubscribe, <a href="${unsubscribeUrl}">click here</a>.</p>
        `,
      });

      this.logger.log(
        `Weather update email sent to ${email} for ${city}, messageId: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send weather update to ${email} for ${city}: ${error.message}`,
      );
      throw error;
    }
  }
}
