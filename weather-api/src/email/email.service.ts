import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: false,
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    });
  }

  async sendConfirmationEmail(
    email: string,
    city: string,
    frequency: string,
    confirmationToken: string,
  ): Promise<void> {
    const confirmUrl = `${this.configService.get('app.url')}/api/confirm/${confirmationToken}`;

    await this.transporter.sendMail({
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

    await this.transporter.sendMail({
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
  }
}
