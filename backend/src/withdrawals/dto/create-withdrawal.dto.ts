import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ description: 'Valor em centavos', example: 10000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ example: '00020126580014br.gov.bcb.pix...' })
  @IsString()
  pixKey: string;

  @ApiProperty({
    description: 'CPF do titular da chave Pix',
    example: '12345678901',
  })
  @IsString()
  document: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
