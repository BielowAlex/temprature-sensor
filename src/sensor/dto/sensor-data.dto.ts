import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SensorDataDto {
  @IsNotEmpty()
  @IsNumber()
  temperature: number;

  @IsNotEmpty()
  @IsNumber()
  humidity: number;

  @IsNotEmpty()
  @IsString()
  sensorId: string;
}
