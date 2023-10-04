import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomersService } from '../customers/customers.service';
import { Customer } from '../customers/customer.schema';
import { JwtPayload } from './jwt-payload.interface';
import { SignInDto } from './SignIn/signIn-dto';
import * as bcrypt from 'bcrypt';

//auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private customersService: CustomersService,
    private jwtService: JwtService,
  ) {}

  async validateCustomerByUsername(
    username: string,
    password: string,
  ): Promise<Customer | null> {
    const customer = await this.customersService.findOne(username);
    if (customer && customer.password === password) {
      return customer;
    }
    return null;
  }

  async signIn(signInDto: SignInDto) {
    const { name, password } = signInDto;
    const user = await this.customersService.findOne(name);
    if (!user) throw new UnauthorizedException();

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) throw new UnauthorizedException();

    const payload = {
      sub: user.password,
      name: user.name,
      id: String(user._id),
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateCustomer(payload: JwtPayload): Promise<Customer | null> {
    return this.customersService.findOneById(payload.customerId);
  }
}
