import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorDataSchema } from './schemas/sensor-data.schema';
import { SensorService } from './sensor.service';
import { SensorGateway } from './sensor.gateway';
import { SensorSchema } from './schemas/sensor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'sensorData', schema: SensorDataSchema },
      { name: 'sensors', schema: SensorSchema },
    ]),
  ],
  providers: [SensorService, SensorGateway],
})
export class SensorModule {}
