import { Module } from '@nestjs/common';
import { SensorModule } from './sensor/sensor.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration globally available
    }),
    SensorModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('DB_URI'),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
