import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherResponseDto } from './dto/weather-response.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string): Promise<WeatherResponseDto> {
    if (!city) {
      throw new HttpException(
        'City parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.weatherService.getWeatherForCity(city);
  }
}
