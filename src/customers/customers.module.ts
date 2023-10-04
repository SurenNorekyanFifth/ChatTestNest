import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer, CustomerSchema } from './customer.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../Database/database.module';
import { UploadModule } from '../upload/upload.module';

//customers.module.ts
@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Customer.modelName, schema: CustomerSchema },
    ]),
    UploadModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
