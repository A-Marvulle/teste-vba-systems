import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { RegisterGatewayUserDto } from './dto/register-gateway-user.dto';
import { LoginGatewayDto } from './dto/login-gateway.dto';
import { LinkGatewayAccountDto } from './dto/link-gateway-account.dto';
import { GatewayAccount } from './entities/gateway-account.entity';
import { UsersService } from '../users/users.service';
import { LeraBoxHttpService } from '../common/lera-box/lera-box-http.service';

const MYSQL_DUPLICATE_ENTRY_ERRNO = 1062;

export interface GatewayLoginResponse {
  access_token: string;
  codigoCliente: number;
  chaveLoja: string;
}

@Injectable()
export class GatewayService {
  constructor(
    private readonly usersService: UsersService,
    private readonly leraBoxHttp: LeraBoxHttpService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,
  ) {}

  async registerUser(dto: RegisterGatewayUserDto): Promise<unknown> {
    return this.leraBoxHttp.publicPost('/users', dto);
  }

  async login(dto: LoginGatewayDto): Promise<GatewayLoginResponse> {
    return this.leraBoxHttp.publicPost<GatewayLoginResponse>(
      '/auth/login',
      dto,
    );
  }

  async linkAccount(
    userId: string,
    dto: LinkGatewayAccountDto,
  ): Promise<Pick<GatewayAccount, 'id' | 'codigoCliente' | 'chaveLoja'>> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { access_token, codigoCliente, chaveLoja } = await this.login({
      document: dto.document,
      password: dto.password,
    });

    if (!access_token || codigoCliente === undefined || !chaveLoja) {
      throw new BadGatewayException('Resposta de login do gateway incompleta');
    }

    const account = this.gatewayAccountRepository.create({
      user: { id: userId },
      codigoCliente: String(codigoCliente),
      chaveLoja,
      accessToken: access_token,
    });

    try {
      const saved = await this.gatewayAccountRepository.save(account);
      return {
        id: saved.id,
        codigoCliente: saved.codigoCliente,
        chaveLoja: saved.chaveLoja,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { errno?: number })?.errno ===
          MYSQL_DUPLICATE_ENTRY_ERRNO
      ) {
        throw new ConflictException(
          'Este usuário já possui uma conta do gateway vinculada',
        );
      }
      throw error;
    }
  }

  async getAccessToken(userId: string): Promise<string> {
    const account = await this.gatewayAccountRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!account) {
      throw new NotFoundException(
        'Usuário não possui conta do gateway vinculada',
      );
    }

    return account.accessToken;
  }
}
