export type FractionLike = {
  n: bigint;
  d: bigint;
  s: bigint;
};

const fractionLikeProps = ['n', 'd', 's'] as const;

export const isFractionLike = (f: unknown): f is FractionLike => {
  return (
    typeof f === 'object' &&
    f !== null &&
    fractionLikeProps.every(
      (prop) => prop in f && typeof (f as FractionLike)[prop] === 'bigint'
    )
  );
};
