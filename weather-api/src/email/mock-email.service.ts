import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockEmailService {
  private readonly logger = new Logger(MockEmailService.name);

  sendConfirmationEmail(
    email: string,
    city: string,
    frequency: string,
    confirmationToken: string,
  ): void {
    const confirmUrl = `http://localhost:3000/api/confirm/${confirmationToken}`;

    this.logger.log('==================== MOCK EMAIL ====================');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Subject: Confirm your weather subscription`);
    this.logger.log(
      `Body: Please confirm your ${frequency} subscription for ${city}`,
    );
    this.logger.log(`Confirmation URL: ${confirmUrl}`);
    this.logger.log('====================================================');
  }

  sendWeatherUpdate(
    email: string,
    city: string,
    temperature: number,
    humidity: number,
    description: string,
    unsubscribeToken: string | null,
  ): void {
    const unsubscribeUrl = unsubscribeToken
      ? `http://localhost:3000/api/unsubscribe/${unsubscribeToken}`
      : 'No unsubscribe token provided';

    this.logger.log('==================== MOCK EMAIL ====================');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Subject: Weather Update for ${city}`);
    this.logger.log(
      `Body: Temperature: ${temperature}°C, Humidity: ${humidity}%, Description: ${description}`,
    );
    this.logger.log(`Unsubscribe URL: ${unsubscribeUrl}`);
    this.logger.log('====================================================');
  }
}
