import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePixPaymentDto {
  @ApiProperty({ description: 'Valor em centavos', example: 15000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'CPF/CNPJ do pagador', example: '12345678901' })
  @IsString()
  payerDocument: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
