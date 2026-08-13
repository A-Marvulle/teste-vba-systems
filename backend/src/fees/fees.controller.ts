import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import type { CardBrand } from './fees.service';

@ApiTags('fees')
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @ApiQuery({
    name: 'brand',
    required: false,
    enum: ['VISA', 'MASTERCARD', 'ELO'],
  })
  @Get()
  list(@Query('brand') brand?: CardBrand) {
    return this.feesService.getFees(brand);
  }
}
