import { getUnitByName } from '@decipad/computer';

export const acceptableOperators = new Set([
  '+',
  '-',
  '*',
  '/',
  '^',
  'mod',
  'per',
  'implicit*',
]);

export function isAcceptableUnit(unitName: string): boolean {
  const wantedQuantities = new Set(['second', 'month']);
  const unit = getUnitByName(unitName);

  if (unit) {
    return (
      wantedQuantities.has(unit.baseQuantity) ||
      unit?.superBaseQuantity === 'currency'
    );
  }
  return false;
}
