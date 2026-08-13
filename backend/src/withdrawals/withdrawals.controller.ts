import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@ApiTags('withdrawals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateWithdrawalDto) {
    return this.withdrawalsService.create(req.user.sub, dto);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.withdrawalsService.findOne(req.user.sub, id);
  }
}
