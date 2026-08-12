import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: AuthTokenPayload = { sub: user.id, email: user.email };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
