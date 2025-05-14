import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherResponseDto } from './dto/weather-response.dto';

@Injectable()
export class WeatherService {
  constructor(private configService: ConfigService) {}

  async getWeatherForCity(city: string): Promise<WeatherResponseDto> {
    try {
      const apiKey = this.configService.get('weather.apiKey');
      const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 400) {
          throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
        } else if (response.status === 404) {
          throw new HttpException('City not found', HttpStatus.NOT_FOUND);
        }
        throw new HttpException(
          'Weather API error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const data = await response.json();

      return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        description: data.current.condition.text,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching weather data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
