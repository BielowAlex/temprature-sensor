import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorData, SensorDataSchema } from './schemas/sensor-data.schema';
import { SensorService } from './sensor.service';
import { SensorGateway } from './sensor.gateway';
import { SensorController } from './sensor.controller';
import { Sensor, SensorSchema } from './schemas/sensor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SensorData.name, schema: SensorDataSchema },
      { name: Sensor.name, schema: SensorSchema },
    ]),
  ],
  providers: [SensorService, SensorGateway],
  controllers: [SensorController],
})
export class SensorModule {}
