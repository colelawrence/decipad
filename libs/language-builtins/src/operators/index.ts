import type { FullBuiltinSpec } from '../interfaces';
import { operators } from './operators';

export { operators };

function normalizeOpName(name: string): string {
  return name.toLowerCase();
}

export function getOperatorByName(name: string): FullBuiltinSpec | null {
  const op = operators[normalizeOpName(name)];
  if (op?.aliasFor) {
    return getOperatorByName(op.aliasFor);
  } else {
    return (op as FullBuiltinSpec) ?? null;
  }
}
