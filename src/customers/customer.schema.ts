import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//customer.schema.ts
@Schema()
export class Customer extends Document {
  static readonly modelName = 'Customer';

  @Prop({ type: Number, required: false })
  id?: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: false })
  profileImage: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
