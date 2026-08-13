import { Injectable, NotFoundException } from '@nestjs/common';
import { LeraBoxHttpService } from '../common/lera-box/lera-box-http.service';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'ELO';

export interface Fee {
  id: string;
  brand: CardBrand;
  installments: number;
  feePercent: number;
  feePercentFormatted: string;
}

export interface FeesResponse {
  total: number;
  fees: Fee[];
}

@Injectable()
export class FeesService {
  constructor(private readonly leraBoxHttp: LeraBoxHttpService) {}

  getFees(brand?: CardBrand): Promise<FeesResponse> {
    return this.leraBoxHttp.publicGet<FeesResponse>('/fees', { brand });
  }

  async getFeePercent(brand: CardBrand, installments: number): Promise<number> {
    const { fees } = await this.getFees(brand);
    const fee = fees.find((f) => f.installments === installments);
    if (!fee) {
      throw new NotFoundException(
        `Taxa não encontrada para ${brand} em ${installments}x`,
      );
    }
    return fee.feePercent;
  }
}
