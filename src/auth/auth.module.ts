import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomersModule } from '../customers/customers.module';
import { DatabaseModule } from '../Database/database.module';

@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
