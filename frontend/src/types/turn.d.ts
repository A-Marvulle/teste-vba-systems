declare module "turn.js";

interface JQuery {
  turn(options?: Record<string, unknown>): JQuery;
  turn(method: string, ...args: unknown[]): unknown;
}
