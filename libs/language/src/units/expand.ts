import Fraction from 'fraction.js';
import { getDefined } from '@decipad/utils';
import { getUnitByName } from './known-units';
import { AST } from '../parser';
import { normalizeUnits } from '../type';
import { expansions } from './expansions';
import { baseUnitForBaseQuantity } from './base-units';
import { identity } from '../utils';

type Converter = (n: Fraction) => Fraction;
type ExpandUnitResult = [AST.Unit[], Converter];

function expandUnit(unit: AST.Unit): ExpandUnitResult {
  const knownUnit = getUnitByName(unit.unit);
  if (knownUnit) {
    const expandTo = expansions[knownUnit.baseQuantity];
    if (expandTo) {
      const unitConverter = getDefined(getUnitByName(unit.unit));
      const newUnits = expandTo.expandedUnits.map((expandedUnit) => {
        const targetUnitName = baseUnitForBaseQuantity(
          expandedUnit.baseQuantity
        );
        return {
          unit: targetUnitName,
          exp: expandedUnit.exp * unit.exp,
          multiplier: unit.multiplier,
          known: true,
        };
      });

      const converter: Converter = (n) =>
        expandTo.convertToExpanded(unitConverter.toBaseQuantity(n));
      return [newUnits, converter];
    }
  }
  return [[unit], identity];
}

export function expandUnits(
  _units: AST.Unit[]
): [AST.Unit[] | null, Converter] {
  let units = _units;
  let converter: Converter = identity;
  let beforeCount = units.length;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [expandedUnits, newConverter] = units
      .map(expandUnit)
      .reduce(
        ([allExpandedUnits, allConverters], [expandedUnits, converter]) => [
          [...(allExpandedUnits ?? []), ...expandedUnits],
          (n) => allConverters(converter(n)),
        ],
        [[], converter]
      );
    units = normalizeUnits(expandedUnits) ?? [];
    converter = newConverter;
    if (units.length === beforeCount) {
      break;
    }
    beforeCount = units.length;
  }
  return [units, converter];
}
