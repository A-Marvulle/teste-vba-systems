import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const CORRELATION_ID_HEADER = 'x-request-id';
const logger = new Logger('HTTP');

export interface RequestWithCorrelationId extends Request {
  correlationId: string;
}

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const correlationId = req.header(CORRELATION_ID_HEADER) || randomUUID();

  (req as RequestWithCorrelationId).correlationId = correlationId;
  res.setHeader(CORRELATION_ID_HEADER, correlationId);

  const start = Date.now();
  res.on('finish', () => {
    logger.log(
      `[${correlationId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`,
    );
  });

  next();
}
