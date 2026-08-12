import { Injectable } from '@nestjs/common';
import { GatewayService } from '../gateway/gateway.service';
import { LeraBoxHttpService } from '../common/lera-box/lera-box-http.service';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly leraBoxHttp: LeraBoxHttpService,
  ) {}

  async getWallet(userId: string) {
    const token = await this.gatewayService.getAccessToken(userId);
    return this.leraBoxHttp.authenticatedGet('/wallet', token);
  }

  async listTransactions(userId: string, query: ListTransactionsQueryDto) {
    const token = await this.gatewayService.getAccessToken(userId);
    return this.leraBoxHttp.authenticatedGet('/wallet/transactions', token, {
      status: query.status,
      type: query.type,
      limit: query.limit,
    });
  }
}
