import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FetchError, ofetch } from 'ofetch';
import { RegisterGatewayUserDto } from './dto/register-gateway-user.dto';
import { LoginGatewayDto } from './dto/login-gateway.dto';
import { LinkGatewayAccountDto } from './dto/link-gateway-account.dto';
import { GatewayAccount } from './entities/gateway-account.entity';

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
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,
  ) {
    this.baseUrl = this.configService.get<string>('GATEWAY_BASE_URL')!;
  }

  async registerUser(dto: RegisterGatewayUserDto): Promise<unknown> {
    return this.request('/users', dto);
  }

  async login(dto: LoginGatewayDto): Promise<GatewayLoginResponse> {
    return this.request<GatewayLoginResponse>('/auth/login', dto);
  }

  async linkAccount(
    dto: LinkGatewayAccountDto,
  ): Promise<Pick<GatewayAccount, 'id' | 'codigoCliente' | 'chaveLoja'>> {
    const { access_token, codigoCliente, chaveLoja } = await this.login({
      document: dto.document,
      password: dto.password,
    });

    if (!access_token || codigoCliente === undefined || !chaveLoja) {
      throw new BadGatewayException(
        'Resposta de login do gateway incompleta',
      );
    }

    const account = this.gatewayAccountRepository.create({
      user: { id: dto.userId },
      codigoCliente: String(codigoCliente),
      chaveLoja,
      accessToken: access_token,
    });
    const saved = await this.gatewayAccountRepository.save(account);

    return {
      id: saved.id,
      codigoCliente: saved.codigoCliente,
      chaveLoja: saved.chaveLoja,
    };
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
