import { BuiltinSpec } from '../interfaces';
import { operators } from './operators';

export { operators };

function normalizeOpName(name: string): string {
  return name.toLowerCase();
}

export function getOperatorByName(name: string): BuiltinSpec | null {
  return operators[normalizeOpName(name)] ?? null;
}
