import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { GatewayStatus } from '../../common/enums/gateway-status.enum';

export type WalletTransactionType = 'PIX' | 'CREDIT_CARD' | 'WITHDRAWAL';

export class ListTransactionsQueryDto {
  @ApiPropertyOptional({ enum: GatewayStatus })
  @IsOptional()
  @IsIn(Object.values(GatewayStatus))
  status?: GatewayStatus;

  @ApiPropertyOptional({ enum: ['PIX', 'CREDIT_CARD', 'WITHDRAWAL'] })
  @IsOptional()
  @IsIn(['PIX', 'CREDIT_CARD', 'WITHDRAWAL'])
  type?: WalletTransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
