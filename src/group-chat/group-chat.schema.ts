import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Customer } from '../customers/customer.schema';

//group-chat.schema.ts
@Schema()
export class GroupChatMessage extends Document {
  @Prop({
    type: [
      { message: String, sender: { type: Types.ObjectId, ref: 'Customer' } },
    ],
  })
  messages: { message: string; sender: Customer }[];

  @Prop({ type: [Types.ObjectId], required: true, ref: 'Customer' })
  groupMembers: Customer[];

  @Prop({ type: String, required: false })
  groupChatId: string;
}

export const GroupChatMessageSchema =
  SchemaFactory.createForClass(GroupChatMessage);
