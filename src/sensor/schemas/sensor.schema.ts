import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SensorDocument = HydratedDocument<Sensor>;

@Schema({
  collection: 'sensors',
  timestamps: true,
})
export class Sensor {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
