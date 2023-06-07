import { once } from './once';

export function toJSON(this: bigint): string {
  return this.toString();
}

export const supportBigIntToJSON = once(() => {
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = toJSON;
});
