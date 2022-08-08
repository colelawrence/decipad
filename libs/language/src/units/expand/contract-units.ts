import { getDefined } from '@decipad/utils';
import { isZero } from '@decipad/fraction';
import { identity, F } from '../../utils';
import { Converter } from '.';
import { expandUnits } from './expand-units';
import { Unit } from '../../type';
import { getUnitByName } from '..';

function scalarInversion(convert: Converter): Converter {
  return (n) => {
    if (isZero(n)) {
      return n;
    }
    const div = convert(F(1));
    return n.div(div);
  };
}

function nonScalarInversion(u: Unit): [Unit, Converter] {
  const knownUnit = getDefined(getUnitByName(u.unit));
  return [u, knownUnit.fromBaseQuantity];
}

export function contractUnits(
  units: Unit[] | null
): [Unit[] | null, Converter] {
  if (!units?.length) {
    return [null, identity];
  }
  const [, converter] = expandUnits(units, nonScalarInversion, scalarInversion);
  return [units, converter];
}
