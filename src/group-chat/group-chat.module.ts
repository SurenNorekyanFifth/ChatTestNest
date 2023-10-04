import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupChatController } from './group-chat.controller';
import { GroupChatService } from './group-chat.service';
import { ChatGateway } from '../gateway/chat.gateway';
import { CustomersModule } from '../customers/customers.module';
import { GroupChatMessage, GroupChatMessageSchema } from './group-chat.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupChatMessage.name, schema: GroupChatMessageSchema },
    ]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    CustomersModule,
  ],
  controllers: [GroupChatController],
  providers: [GroupChatService, ChatGateway],
})
export class GroupChatModule {}
