import { Body, Controller, Post } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { RegisterGatewayUserDto } from './dto/register-gateway-user.dto';
import { LoginGatewayDto } from './dto/login-gateway.dto';
import { LinkGatewayAccountDto } from './dto/link-gateway-account.dto';

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

  @Post('accounts')
  linkAccount(@Body() dto: LinkGatewayAccountDto) {
    return this.gatewayService.linkAccount(dto);
  }
}
