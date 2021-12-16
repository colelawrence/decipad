import { getDefined } from '@decipad/utils';
import { AST } from '../../parser';
import { identity, F } from '../../utils';
import { Converter } from '.';
import { expandUnits, doesNotScaleOnConversion } from './expand-units';
import { stringifyUnits } from '../../type';
import { getUnitByName } from '..';

function invert(convert: Converter): Converter {
  return (n) => {
    const div = convert(F(1));
    return n.div(div);
  };
}

function nonScalarContraction(units: AST.Units): [AST.Units, Converter] {
  const u = units?.args || [];
  if (u.length !== 1) {
    throw new TypeError(
      `Don't know how to expand non-scalar unit ${stringifyUnits(units)}`
    );
  }
  const knownUnit = getDefined(getUnitByName(u[0].unit));
  return [units, knownUnit.fromBaseQuantity];
}

export function contractUnits(
  units: AST.Units | null
): [AST.Units | null, Converter] {
  if (units === null) {
    return [null, identity];
  }
  if (units.args.some(doesNotScaleOnConversion)) {
    return nonScalarContraction(units);
  }
  const [, converter] = expandUnits(units);
  return [units, invert(converter)];
}
