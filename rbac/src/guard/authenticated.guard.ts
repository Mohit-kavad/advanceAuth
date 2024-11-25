import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      return false;
    }

    try {
      const token = authorization.split(' ')[1];
      const user = this.jwtService.verify(token, { secret: 'abcd123' });

      if (!user) {
        return false;
      }

      request.user = user;
      return true;
    } catch (e) {
      console.log('🚀 ~ AuthenticatedGuard ~ e:', e);
      return false;
    }
  }
}
