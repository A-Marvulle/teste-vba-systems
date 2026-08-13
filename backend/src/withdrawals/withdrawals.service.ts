import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { GatewayService } from '../gateway/gateway.service';
import { LeraBoxHttpService } from '../common/lera-box/lera-box-http.service';
import {
  GatewayStatus,
  toGatewayStatus,
} from '../common/enums/gateway-status.enum';
import { Withdrawal } from './entities/withdrawal.entity';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

interface GatewayWithdrawalResponse {
  id?: string;
  status?: string;
  [key: string]: unknown;
}

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly leraBoxHttp: LeraBoxHttpService,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {}

  async create(userId: string, dto: CreateWithdrawalDto) {
    const token = await this.gatewayService.getAccessToken(userId);
    const externalReference = randomUUID();

    const response =
      await this.leraBoxHttp.authenticatedPost<GatewayWithdrawalResponse>(
        '/withdrawals',
        token,
        {
          amount: dto.amount,
          pixKey: dto.pixKey,
          document: dto.document,
          description: dto.description,
          externalReference,
        },
      );

    const withdrawal = await this.withdrawalRepository.save(
      this.withdrawalRepository.create({
        user: { id: userId },
        amount: dto.amount,
        pixKey: dto.pixKey,
        document: dto.document,
        externalReference,
        gatewayWithdrawalId: response.id ?? null,
        status: toGatewayStatus(response.status),
        rawResponse: response,
      }),
    );

    return this.toView(withdrawal);
  }

  async findOne(userId: string, id: string) {
    let withdrawal = await this.withdrawalRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!withdrawal) {
      throw new NotFoundException('Saque não encontrado');
    }

    if (
      withdrawal.status === GatewayStatus.PENDING &&
      withdrawal.gatewayWithdrawalId
    ) {
      const token = await this.gatewayService.getAccessToken(userId);
      const response =
        await this.leraBoxHttp.authenticatedGet<GatewayWithdrawalResponse>(
          `/withdrawals/${withdrawal.gatewayWithdrawalId}`,
          token,
        );

      withdrawal.status = toGatewayStatus(response.status);
      withdrawal.rawResponse = response;
      withdrawal = await this.withdrawalRepository.save(withdrawal);
    }

    return this.toView(withdrawal);
  }

  private toView(withdrawal: Withdrawal) {
    return {
      id: withdrawal.id,
      externalReference: withdrawal.externalReference,
      amount: withdrawal.amount,
      pixKey: withdrawal.pixKey,
      status: withdrawal.status,
    };
  }
}
