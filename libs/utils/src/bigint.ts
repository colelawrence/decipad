import { once } from 'ramda';

export function toJSON(this: bigint): string {
  return this.toString();
}

export const supportBigIntToJSON = once(() => {
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = toJSON;
});
