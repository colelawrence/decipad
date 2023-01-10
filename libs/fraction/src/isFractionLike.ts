export type FractionLike = {
  n: bigint | number | string;
  d: bigint | number | string;
  s: bigint | number | string;
};

export type AcceptableFractionLike = {
  n: bigint;
  d: bigint;
  s: bigint;
};

export const fractionLikeProps = ['n', 'd', 's'] as const;

const isFractionLikeProp = (
  f: Record<string, unknown>,
  prop: string
): boolean => {
  if (!(prop in f)) {
    return false;
  }
  const tof = typeof f[prop];
  return tof === 'number' || tof === 'bigint' || tof === 'string';
};

export const isFractionLike = (f: unknown): f is FractionLike => {
  return (
    typeof f === 'object' &&
    f != null &&
    fractionLikeProps.every((prop) =>
      isFractionLikeProp(f as Record<string, unknown>, prop)
    )
  );
};
