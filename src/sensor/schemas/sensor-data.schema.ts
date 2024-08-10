import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SensorDataDocument = HydratedDocument<SensorData>;

@Schema({
  timestamps: true,
})
export class SensorData {
  _id: Types.ObjectId;
  @Prop({ required: true })
  temperature: number;
  @Prop({ required: false })
  humidity: number;
  @Prop({ type: Types.ObjectId, ref: 'Sensor', required: true })
  sensor: Types.ObjectId;
}

export const SensorDataSchema = SchemaFactory.createForClass(SensorData);
