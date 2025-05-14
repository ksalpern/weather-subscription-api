import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MockEmailService } from './mock-email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EmailService,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        if (nodeEnv === 'development' || nodeEnv === 'test') {
          return new MockEmailService();
        }
        return new EmailService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
