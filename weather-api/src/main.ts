import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';

async function bootstrap() {
  const app = await NestFactory.create(WeatherModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
