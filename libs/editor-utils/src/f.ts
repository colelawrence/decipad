interface FLike {
  n: bigint;
  d: bigint;
  s: bigint;
}

export const F = (n: number): FLike => ({ n: BigInt(n), d: 1n, s: 1n });
