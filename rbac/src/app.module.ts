import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './app.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthenticatedGuard } from './guard/authenticated.guard';
import { AuthController } from './auth.controller';
import { UsersController } from './app.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'abcd123',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtStrategy, AuthenticatedGuard],
  exports: [AuthenticatedGuard],
})
export class AuthModule {}
