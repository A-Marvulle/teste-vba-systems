export enum GatewayStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export function toGatewayStatus(status?: string): GatewayStatus {
  if (status === 'APPROVED') return GatewayStatus.APPROVED;
  if (status === 'DENIED') return GatewayStatus.DENIED;
  if (status === 'EXPIRED') return GatewayStatus.EXPIRED;
  if (status === 'CANCELLED') return GatewayStatus.CANCELLED;
  return GatewayStatus.PENDING;
}
