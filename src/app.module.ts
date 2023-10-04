import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { GroupChatModule } from './group-chat/group-chat.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb+srv://surosuro123:kPudUyT3YcAGp7Ye@cluster0.jthzfgg.mongodb.net/?retryWrites=true&w=majority',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'attachments'),
      serveRoot: '/attachments',
    }),
    CustomersModule,
    AuthModule,
    GroupChatModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
