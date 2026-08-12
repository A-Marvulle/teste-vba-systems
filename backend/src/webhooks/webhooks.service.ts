import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { GatewayService } from '../gateway/gateway.service';
import { LeraBoxHttpService } from '../common/lera-box/lera-box-http.service';
import { toGatewayStatus } from '../common/enums/gateway-status.enum';
import { CheckoutLink } from '../payments/entities/checkout-link.entity';
import { Order } from '../payments/entities/order.entity';
import { Withdrawal } from '../withdrawals/entities/withdrawal.entity';
import { WebhookEvent } from './entities/webhook-event.entity';

const MYSQL_DUPLICATE_ENTRY_ERRNO = 1062;
const WEBHOOK_EVENTS = ['PAYMENT_PIX', 'PAYMENT_CARD', 'WITHDRAWAL'] as const;

interface InboundPayload {
  event?: string;
  type?: string;
  status?: string;
  externalReference?: string;
  [key: string]: unknown;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhookSecret?: string;
  private readonly webhookBaseUrl?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly gatewayService: GatewayService,
    private readonly leraBoxHttp: LeraBoxHttpService,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    @InjectRepository(CheckoutLink)
    private readonly checkoutLinkRepository: Repository<CheckoutLink>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {
    this.webhookSecret = this.configService.get<string>('WEBHOOK_SECRET');
    this.webhookBaseUrl = this.configService.get<string>('WEBHOOK_BASE_URL');
  }

  async registerAll(userId: string) {
    const token = await this.gatewayService.getAccessToken(userId);
    const url = `${this.webhookBaseUrl}/api/webhooks/inbound`;

    const results = [];
    for (const event of WEBHOOK_EVENTS) {
      results.push(
        await this.leraBoxHttp.authenticatedPost('/webhooks', token, {
          event,
          url,
          secret: this.webhookSecret,
        }),
      );
    }
    return results;
  }

  async list(userId: string) {
    const token = await this.gatewayService.getAccessToken(userId);
    return this.leraBoxHttp.authenticatedGet('/webhooks', token);
  }

  async remove(userId: string, id: string) {
    const token = await this.gatewayService.getAccessToken(userId);
    return this.leraBoxHttp.authenticatedDelete(`/webhooks/${id}`, token);
  }

  verifySignature(rawBody: Buffer | undefined, signature: string | undefined): boolean {
    if (!this.webhookSecret) {
      return true;
    }
    if (!rawBody || !signature) {
      return false;
    }

    const expected = createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const signatureBuf = Buffer.from(signature, 'hex');
    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }
    return timingSafeEqual(expectedBuf, signatureBuf);
  }

  async handleInbound(payload: InboundPayload, signatureValid: boolean) {
    if (!signatureValid) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

    const event = payload.event ?? payload.type ?? 'UNKNOWN';
    const externalReference = payload.externalReference ?? null;

    const webhookEvent = this.webhookEventRepository.create({
      event,
      externalReference,
      signatureValid: true,
      payload,
    });

    try {
      await this.webhookEventRepository.save(webhookEvent);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { errno?: number })?.errno ===
          MYSQL_DUPLICATE_ENTRY_ERRNO
      ) {
        this.logger.warn(`Webhook duplicado ignorado: ${event}/${externalReference}`);
        return { ok: true, duplicate: true };
      }
      throw error;
    }

    if (externalReference) {
      await this.applyStatusUpdate(event, externalReference, payload.status);
    }

    webhookEvent.processed = true;
    webhookEvent.processedAt = new Date();
    await this.webhookEventRepository.save(webhookEvent);

    return { ok: true };
  }

  private async applyStatusUpdate(
    event: string,
    externalReference: string,
    rawStatus?: string,
  ) {
    const status = toGatewayStatus(rawStatus);

    if (event === 'WITHDRAWAL') {
      await this.withdrawalRepository.update({ externalReference }, { status });
      return;
    }

    const checkoutLink = await this.checkoutLinkRepository.findOne({
      where: { externalReference },
    });
    if (!checkoutLink) {
      this.logger.warn(`CheckoutLink não encontrado para ${externalReference}`);
      return;
    }

    checkoutLink.status = status;
    await this.checkoutLinkRepository.save(checkoutLink);
    await this.orderRepository.update({ checkoutLink: { id: checkoutLink.id } }, { status });
  }
}
