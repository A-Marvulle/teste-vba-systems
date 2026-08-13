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
import { PaymentsService } from './payments.service';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pix')
  createPix(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePixPaymentDto,
  ) {
    return this.paymentsService.createPix(req.user.sub, dto);
  }

  @Post('card')
  createCard(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCardPaymentDto,
  ) {
    return this.paymentsService.createCard(req.user.sub, dto);
  }

  @Get(':checkoutLinkId')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('checkoutLinkId') checkoutLinkId: string,
  ) {
    return this.paymentsService.findOne(req.user.sub, checkoutLinkId);
  }
}
