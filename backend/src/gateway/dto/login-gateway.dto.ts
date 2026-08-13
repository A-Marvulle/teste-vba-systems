import { IsString, Matches, MinLength } from 'class-validator';

export class LoginGatewayDto {
  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'document deve ser CPF (11) ou CNPJ (14)',
  })
  document: string;

  @IsString()
  @MinLength(6)
  password: string;
}
