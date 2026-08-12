import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@Req() req: AuthenticatedRequest) {
    return this.walletService.getWallet(req.user.sub);
  }

  @Get('transactions')
  listTransactions(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.walletService.listTransactions(req.user.sub, query);
  }
}
