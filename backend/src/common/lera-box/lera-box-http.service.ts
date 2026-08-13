import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FetchError, ofetch } from 'ofetch';

type Query = Record<string, string | number | boolean | undefined>;

@Injectable()
export class LeraBoxHttpService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.getOrThrow<string>('GATEWAY_BASE_URL');
  }

  publicGet<T>(path: string, query?: Query): Promise<T> {
    return this.request<T>(path, { method: 'GET', query });
  }

  publicPost<T>(path: string, body: object): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  authenticatedGet<T>(path: string, token: string, query?: Query): Promise<T> {
    return this.request<T>(path, { method: 'GET', query, token });
  }

  authenticatedPost<T>(path: string, token: string, body: object): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, token });
  }

  authenticatedDelete<T>(path: string, token: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', token });
  }

  private async request<T>(
    path: string,
    options: {
      method: 'GET' | 'POST' | 'DELETE';
      body?: object;
      query?: Query;
      token?: string;
    },
  ): Promise<T> {
    try {
      return await ofetch<T>(`${this.baseUrl}${path}`, {
        method: options.method,
        body: options.body ? { ...options.body } : undefined,
        query: options.query,
        headers: options.token
          ? { Authorization: `Bearer ${options.token}` }
          : undefined,
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
