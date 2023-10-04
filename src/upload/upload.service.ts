// upload.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Param,
  UploadedFile,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from '../customers/customer.schema';
import { Model } from 'mongoose';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class UploadService {
  constructor(private customersService: CustomersService) {}
  async updateProfilePhoto(@Param('id') id: string, @UploadedFile() file) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      const customer = await this.customersService.findOneAndUpdate(
        { _id: id },
        { $set: { profileImage: uniqueFilename } },
        { new: true },
      );

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const uploadPath = path.join('public/attachments', uniqueFilename);
      await fs.writeFile(uploadPath, file.buffer);

      return { message: 'Profile photo updated successfully', customer };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw new InternalServerErrorException('Error uploading profile photo');
    }
  }
}
