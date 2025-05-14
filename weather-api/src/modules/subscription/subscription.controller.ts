import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  async subscribe(@Body() subscribeDto: SubscribeDto) {
    return this.subscriptionService.subscribe(subscribeDto);
  }

  @Get('confirm/:token')
  async confirmSubscription(@Param('token') token: string) {
    return this.subscriptionService.confirmSubscription(token);
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string) {
    return this.subscriptionService.unsubscribe(token);
  }
}
