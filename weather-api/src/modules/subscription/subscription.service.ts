import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  Subscription,
  SubscriptionFrequency,
} from './entities/subscription.entity';
import { EmailService } from '../../email/email.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private emailService: EmailService,
  ) {}

  async subscribe(subscribeDto: SubscribeDto): Promise<{ message: string }> {
    // Check if subscription already exists and is confirmed
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        email: subscribeDto.email,
        city: subscribeDto.city,
        confirmed: true,
      },
    });

    if (existingSubscription) {
      throw new HttpException(
        'Email already subscribed for this city',
        HttpStatus.CONFLICT,
      );
    }

    // Generate tokens
    const confirmationToken = uuidv4();
    const unsubscribeToken = uuidv4();

    // Create new subscription or update existing unconfirmed one
    let subscription = await this.subscriptionRepository.findOne({
      where: {
        email: subscribeDto.email,
        city: subscribeDto.city,
      },
    });

    if (subscription) {
      subscription.frequency = subscribeDto.frequency;
      subscription.confirmationToken = confirmationToken;
      subscription.unsubscribeToken = unsubscribeToken;
      subscription.confirmed = false;
    } else {
      subscription = this.subscriptionRepository.create({
        ...subscribeDto,
        confirmationToken,
        unsubscribeToken,
        confirmed: false,
      });
    }

    await this.subscriptionRepository.save(subscription);
    // Send confirmation email
    await this.emailService.sendConfirmationEmail(
      subscribeDto.email,
      subscribeDto.city,
      subscribeDto.frequency,
      confirmationToken,
    );

    return {
      message: 'Subscription initiated. Please check your email to confirm.',
    };
  }

  async confirmSubscription(token: string): Promise<{ message: string }> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { confirmationToken: token },
    });

    if (!subscription) {
      throw new HttpException('Invalid or expired token', HttpStatus.NOT_FOUND);
    }

    subscription.confirmed = true;
    subscription.confirmationToken = null; // Clear the token after use
    await this.subscriptionRepository.save(subscription);

    return { message: 'Subscription confirmed successfully' };
  }

  async unsubscribe(token: string): Promise<{ message: string }> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { unsubscribeToken: token },
    });

    if (!subscription) {
      throw new HttpException('Invalid or expired token', HttpStatus.NOT_FOUND);
    }

    await this.subscriptionRepository.remove(subscription);

    return { message: 'Unsubscribed successfully' };
  }

  async getConfirmedSubscriptionsByFrequency(
    frequency: SubscriptionFrequency,
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: {
        frequency,
        confirmed: true,
      },
    });
  }
}
