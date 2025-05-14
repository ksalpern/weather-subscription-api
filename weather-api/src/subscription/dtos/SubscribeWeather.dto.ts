import { IsString } from 'class-validator';

export class SubscribeWeatherDto {
  @IsString()
  city: string;
}
