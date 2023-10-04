import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from './auth.service';
import { CustomersService } from '../customers/customers.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthModule } from './auth.module';
import { CustomersModule } from '../customers/customers.module';
import { CreateCustomerDto } from '../customers/create-customer.dto';

const mockAccessToken = 'mockAccessToken';
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let customersService: CustomersService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  // Define the mock behavior without circular reference.
  const mockCustomersService = {
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync() {
      return mockAccessToken;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule, AuthModule],
    })
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    customersService = module.get<CustomersService>(CustomersService);
  });

  describe('signIn', () => {
    it('should return access token when valid credentials are provided', async () => {
      const mockSignInDto = { name: 'testuser', password: 'testpassword' };
      const customerDto: CreateCustomerDto = {
        name: 'testuser',
        password: 'testpassword',
      };
      const newCustomer = await customersService.create(customerDto);
      console.log(newCustomer, 'newCustomer');

      // mockAuthService.signIn.mockResolvedValue({
      //   access_token: mockAccessToken,
      // });

      const result = await authController.signIn(mockSignInDto);

      expect(result).toEqual({ access_token: mockAccessToken });

      const comparedPasswords = await bcrypt.compare(
        mockSignInDto.password,
        newCustomer.password,
      );

      expect(comparedPasswords).toEqual(true);
      expect(newCustomer).toBeDefined();
    });

    it('should throw UnauthorizedException if invalid credentials are provided', async () => {
      const signInDto = {
        name: 'testuser',
        password: 'invalidpassword',
      };
      try {
        await authController.signIn(signInDto);
      } catch (error) {
        console.log(error, 'ERROR');
        expect(error.response.message).toBe('Unauthorized');
        expect(error.status).toBe(401);
      }
    });
  });
});
