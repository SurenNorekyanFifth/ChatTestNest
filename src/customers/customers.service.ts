import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './customer.schema';
import { CreateCustomerDto } from './create-customer.dto';
import * as bcrypt from 'bcrypt';

//customers.service.ts
@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.modelName) private customerModel: Model<Customer>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return await this.customerModel.find().exec();
  }

  async findOne(name: string): Promise<Customer | undefined> {
    return this.customerModel.findOne({ name }).exec();
  }

  async findOneById(id: string): Promise<Customer | undefined> {
    return this.customerModel.findById(id).exec();
  }

  async findManyByIds(ids: string[]): Promise<Customer[]> {
    return this.customerModel.find({ _id: { $in: ids } }).exec();
  }

  async create(customer: CreateCustomerDto): Promise<Customer> {
    const { password, ...rest } = customer;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdCustomer = await this.customerModel.create({
      ...rest,
      password: hashedPassword,
    });

    const { _id, ...customerData } = createdCustomer.toObject();

    return {
      id: _id,
      ...customerData,
    } as Customer;
  }

  async findOneAndUpdate(filter: any, update: any, options: any) {
    try {
      const customer = await this.customerModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    await this.customerModel.deleteMany({}).exec();
  }
}
