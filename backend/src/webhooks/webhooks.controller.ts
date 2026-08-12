import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(@Req() req: AuthenticatedRequest) {
    return this.webhooksService.registerAll(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.webhooksService.list(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.webhooksService.remove(req.user.sub, id);
  }

  @Post('inbound')
  @HttpCode(200)
  inbound(
    @Req() req: RequestWithRawBody,
    @Body() body: Record<string, unknown>,
    @Headers('x-lera-box-signature') signature?: string,
  ) {
    const signatureValid = this.webhooksService.verifySignature(
      req.rawBody,
      signature,
    );
    return this.webhooksService.handleInbound(body, signatureValid);
  }
}
