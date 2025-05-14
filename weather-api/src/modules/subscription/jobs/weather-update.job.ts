import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '../subscription.service';
import { WeatherService } from '../../weather/weather.service';
import { EmailService } from '../../../email/email.service';
import { SubscriptionFrequency } from '../entities/subscription.entity';

@Injectable()
export class WeatherUpdateJob {
  private readonly logger = new Logger(WeatherUpdateJob.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly weatherService: WeatherService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendHourlyUpdates() {
    this.logger.log('Sending hourly weather updates');
    await this.sendWeatherUpdates(SubscriptionFrequency.HOURLY);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyUpdates() {
    this.logger.log('Sending daily weather updates');
    await this.sendWeatherUpdates(SubscriptionFrequency.DAILY);
  }

  private async sendWeatherUpdates(frequency: SubscriptionFrequency) {
    try {
      const subscriptions =
        await this.subscriptionService.getConfirmedSubscriptionsByFrequency(
          frequency,
        );

      this.logger.log(
        `Found ${subscriptions.length} ${frequency} subscriptions to process`,
      );

      for (const subscription of subscriptions) {
        try {
          const weatherData = await this.weatherService.getWeatherForCity(
            subscription.city,
          );

          // Skip subscriptions with null unsubscribe tokens
          if (!subscription.unsubscribeToken) {
            this.logger.warn(
              `Skipping weather update for ${subscription.email}: Missing unsubscribe token`,
            );
            continue;
          }

          await this.emailService.sendWeatherUpdate(
            subscription.email,
            subscription.city,
            weatherData.temperature,
            weatherData.humidity,
            weatherData.description,
            subscription.unsubscribeToken,
          );

          this.logger.log(
            `Sent ${frequency} weather update to ${subscription.email} for ${subscription.city}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send weather update to ${subscription.email}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error processing ${frequency} weather updates: ${error.message}`,
      );
    }
  }
}
