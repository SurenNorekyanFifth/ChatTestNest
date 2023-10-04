// database.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb+srv://surosuro123:kPudUyT3YcAGp7Ye@cluster0.jthzfgg.mongodb.net/?retryWrites=true&w=majority',
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
