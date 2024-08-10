import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSensorDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
