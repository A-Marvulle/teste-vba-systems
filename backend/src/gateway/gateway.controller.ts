import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { RegisterGatewayUserDto } from './dto/register-gateway-user.dto';
import { LoginGatewayDto } from './dto/login-gateway.dto';
import { LinkGatewayAccountDto } from './dto/link-gateway-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';

@ApiTags('gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('register')
  register(@Body() dto: RegisterGatewayUserDto) {
    return this.gatewayService.registerUser(dto);
  }

  @Post('login')
  login(@Body() dto: LoginGatewayDto) {
    return this.gatewayService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('accounts')
  linkAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: LinkGatewayAccountDto,
  ) {
    return this.gatewayService.linkAccount(req.user.sub, dto);
  }
}
