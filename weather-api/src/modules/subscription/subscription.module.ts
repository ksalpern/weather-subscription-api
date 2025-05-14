import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { EmailModule } from '../../email/email.module';
import { WeatherModule } from '../weather/weather.module';
import { WeatherUpdateJob } from './jobs/weather-update.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    EmailModule,
    WeatherModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, WeatherUpdateJob],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
