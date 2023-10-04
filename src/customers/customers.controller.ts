import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.schema';
import { CreateCustomerDto } from './create-customer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { UploadService } from '../upload/upload.service';

//customers.controller.ts
@Controller('/customers')
export class CustomersController {
  constructor(
    private customersService: CustomersService,
    private uploadService: UploadService,
  ) {}

  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }
  @Get('/:id/profile-photo')
  async getProfilePhoto(@Param('id') id: string): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }
  @Post('/:id/profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Param('id') id: string, @UploadedFile() file) {
    console.log(file); // This should log the file object
    console.log(id); // This should log the 'id' parameter
  }

  @Put('/:id/profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePhoto(@Param('id') id: string, @UploadedFile() file) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      const result = await this.uploadService.updateProfilePhoto(id, file);

      return result;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw new InternalServerErrorException('Error uploading profile photo');
    }
  }

  // @Put('/:id/profile-photo')
  // @UseInterceptors(FileInterceptor('file'))
  // async updateProfilePhoto(@Param('id') id: string, @UploadedFile() file) {
  //   try {
  //     if (!file) {
  //       throw new BadRequestException('No file uploaded');
  //     }
  //
  //     const uniqueFilename = `${Date.now()}-${file.originalname}`;
  //     const customer = await this.customersService.findOneAndUpdate(
  //       { _id: id },
  //       { $set: { profileImage: uniqueFilename } },
  //       { new: true },
  //     );
  //
  //     if (!customer) {
  //       throw new NotFoundException('Customer not found');
  //     }
  //
  //     const uploadPath = path.join(
  //       '/home/fifth-13/WebstormProjects/ReactChatTS/chat-typescript-app/public/userImages',
  //       uniqueFilename,
  //     );
  //     await fs.promises.writeFile(uploadPath, file.buffer);
  //
  //     return { message: 'Profile photo updated successfully', customer };
  //   } catch (error) {
  //     console.error('Error uploading profile photo:', error);
  //     throw new InternalServerErrorException('Error uploading profile photo');
  //   }
  // }
}
