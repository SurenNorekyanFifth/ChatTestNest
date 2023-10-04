import { forwardRef, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CustomersModule } from '../customers/customers.module';

//upload.module.ts
@Module({
  imports: [forwardRef(() => CustomersModule)],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
