import { IsEmail, IsIn, IsString, Matches, MinLength } from 'class-validator';

export class RegisterGatewayUserDto {
  @IsIn(['PF', 'PJ'], {
    message: 'personType must be one of the following values: PF, PJ',
  })
  personType: 'PF' | 'PJ';

  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[1-9]{2}9\d{8}$/, {
    message:
      'phone deve ser celular BR válido: DDD + 9 + 8 dígitos (ex: 11999998888)',
  })
  phone: string;

  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'document deve ser CPF (11) ou CNPJ (14)',
  })
  document: string;

  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos' })
  zipCode: string;

  @IsString()
  @MinLength(3)
  address: string;

  @IsString()
  @MinLength(1)
  number: string;

  @IsString()
  @MinLength(2)
  neighborhood: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'state deve ser UF com 2 letras' })
  state: string;
}
