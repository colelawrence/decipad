export function toJSON(this: bigint): string {
  return this.toString();
}

(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = toJSON;
