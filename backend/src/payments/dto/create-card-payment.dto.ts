import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { CardBrand } from '../../fees/fees.service';

export class CreateCardPaymentDto {
  @ApiProperty({ description: 'Valor bruto em centavos', example: 25000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: ['VISA', 'MASTERCARD', 'ELO'] })
  @IsIn(['VISA', 'MASTERCARD', 'ELO'])
  brand: CardBrand;

  @ApiProperty({ example: '4111111111111111' })
  @IsString()
  cardNumber: string;

  @ApiProperty({ example: 'MARIA SILVA' })
  @IsString()
  cardHolder: string;

  @ApiProperty({ example: '12' })
  @IsString()
  expiryMonth: string;

  @ApiProperty({ example: '2030' })
  @IsString()
  expiryYear: string;

  @ApiProperty({ example: '123' })
  @IsString()
  cvv: string;

  @ApiProperty({ minimum: 1, maximum: 21, example: 3 })
  @IsInt()
  @Min(1)
  @Max(21)
  installments: number;

  @ApiProperty({
    description:
      'Taxa percentual consultada em GET /fees; deve bater exatamente',
    example: 3.19,
  })
  @IsNumber()
  feePercent: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
