import { singular } from 'pluralize';

const typeCoercionTargetList = ['table'] as const;

export type TypeCoercionTarget = typeof typeCoercionTargetList[number];

const typeCoercionTargets = new Set(
  typeCoercionTargetList as ReadonlyArray<string>
);

export const isTypeCoercionTarget = (
  target: string
): target is TypeCoercionTarget => {
  return typeCoercionTargets.has(singular(target.toLowerCase()));
};
