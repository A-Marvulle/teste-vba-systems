import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { GatewayService } from '../gateway/gateway.service';
import { LeraBoxHttpService } from '../common/lera-box/lera-box-http.service';
import { FeesService } from '../fees/fees.service';
import { CheckoutLink } from './entities/checkout-link.entity';
import { Order } from './entities/order.entity';
import { CheckoutMethod, CheckoutStatus } from './enums/checkout-status.enum';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';

interface GatewayPaymentResponse {
  id?: string;
  txid?: string;
  status?: string;
  qrCodeBase64?: string;
  emv?: string;
  [key: string]: unknown;
}

function toCheckoutStatus(status?: string): CheckoutStatus {
  if (status === 'APPROVED') return CheckoutStatus.APPROVED;
  if (status === 'DENIED') return CheckoutStatus.DENIED;
  return CheckoutStatus.PENDING;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly leraBoxHttp: LeraBoxHttpService,
    private readonly feesService: FeesService,
    @InjectRepository(CheckoutLink)
    private readonly checkoutLinkRepository: Repository<CheckoutLink>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createPix(userId: string, dto: CreatePixPaymentDto) {
    const token = await this.gatewayService.getAccessToken(userId);
    const externalReference = randomUUID();

    const response =
      await this.leraBoxHttp.authenticatedPost<GatewayPaymentResponse>(
        '/payments/pix',
        token,
        {
          amount: dto.amount,
          payerDocument: dto.payerDocument,
          description: dto.description,
          externalReference,
        },
      );

    const status = toCheckoutStatus(response.status);

    const checkoutLink = await this.checkoutLinkRepository.save(
      this.checkoutLinkRepository.create({
        user: { id: userId },
        method: CheckoutMethod.PIX,
        amount: dto.amount,
        externalReference,
        status,
      }),
    );

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        checkoutLink,
        gatewayPaymentId: response.id ?? response.txid ?? null,
        qrCodeBase64: response.qrCodeBase64 ?? null,
        emv: response.emv ?? null,
        status,
        rawResponse: response,
      }),
    );

    return this.toPaymentView(checkoutLink, order);
  }

  async createCard(userId: string, dto: CreateCardPaymentDto) {
    const tableFeePercent = await this.feesService.getFeePercent(
      dto.brand,
      dto.installments,
    );

    if (tableFeePercent.toFixed(2) !== dto.feePercent.toFixed(2)) {
      throw new BadRequestException(
        `feePercent divergente da tabela do gateway para ${dto.brand} em ${dto.installments}x (esperado ${tableFeePercent.toFixed(2)})`,
      );
    }

    const token = await this.gatewayService.getAccessToken(userId);
    const externalReference = randomUUID();

    const response =
      await this.leraBoxHttp.authenticatedPost<GatewayPaymentResponse>(
        '/payments/card',
        token,
        {
          amount: dto.amount,
          cardNumber: dto.cardNumber,
          cardHolder: dto.cardHolder,
          expiryMonth: dto.expiryMonth,
          expiryYear: dto.expiryYear,
          cvv: dto.cvv,
          installments: dto.installments,
          feePercent: dto.feePercent,
          description: dto.description,
          externalReference,
        },
      );

    const status = toCheckoutStatus(response.status);

    const checkoutLink = await this.checkoutLinkRepository.save(
      this.checkoutLinkRepository.create({
        user: { id: userId },
        method: CheckoutMethod.CARD,
        amount: dto.amount,
        installments: dto.installments,
        feePercent: dto.feePercent.toFixed(2),
        externalReference,
        status,
      }),
    );

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        checkoutLink,
        gatewayPaymentId: response.id ?? response.txid ?? null,
        status,
        rawResponse: response,
      }),
    );

    return this.toPaymentView(checkoutLink, order);
  }

  async findOne(userId: string, checkoutLinkId: string) {
    const checkoutLink = await this.checkoutLinkRepository.findOne({
      where: { id: checkoutLinkId, user: { id: userId } },
      relations: { order: true },
    });

    if (!checkoutLink) {
      throw new NotFoundException('Checkout não encontrado');
    }

    return this.toPaymentView(checkoutLink, checkoutLink.order);
  }

  private toPaymentView(checkoutLink: CheckoutLink, order: Order) {
    return {
      checkoutLinkId: checkoutLink.id,
      externalReference: checkoutLink.externalReference,
      method: checkoutLink.method,
      amount: checkoutLink.amount,
      installments: checkoutLink.installments,
      feePercent: checkoutLink.feePercent,
      status: checkoutLink.status,
      qrCodeBase64: order?.qrCodeBase64 ?? null,
      emv: order?.emv ?? null,
    };
  }
}
