import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { FetchError, ofetch } from 'ofetch';
import { RegisterGatewayUserDto } from './dto/register-gateway-user.dto';
import { LoginGatewayDto } from './dto/login-gateway.dto';
import { LinkGatewayAccountDto } from './dto/link-gateway-account.dto';
import { GatewayAccount } from './entities/gateway-account.entity';
import { UsersService } from '../users/users.service';

const MYSQL_DUPLICATE_ENTRY_ERRNO = 1062;

export interface GatewayLoginResponse {
  access_token: string;
  codigoCliente: number;
  chaveLoja: string;
}

@Injectable()
export class GatewayService {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('GATEWAY_BASE_URL');
  }

  async registerUser(dto: RegisterGatewayUserDto): Promise<unknown> {
    return this.request('/users', dto);
  }

  async login(dto: LoginGatewayDto): Promise<GatewayLoginResponse> {
    return this.request<GatewayLoginResponse>('/auth/login', dto);
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

  private async request<T>(path: string, body: object): Promise<T> {
    try {
      return await ofetch<T>(`${this.baseUrl}${path}`, {
        method: 'POST',
        body: body as Record<string, unknown>,
      });
    } catch (error) {
      if (error instanceof FetchError && error.response) {
        if (error.response.status === 401) {
          throw new UnauthorizedException(error.response._data);
        }
        throw new BadGatewayException(error.response._data);
      }
      throw new BadGatewayException('Falha ao comunicar com o gateway');
    }
  }
}
