import { getDefined, identity } from '@decipad/utils';
import { ONE } from '@decipad/number';
import { Converter } from '.';
import { expandUnits } from './expand-units';
import { Unit } from '../../type';
import { getUnitByName } from '..';

function scalarInversion(convert: Converter): Converter {
  return (n) => {
    if (n.isZero()) {
      return n;
    }
    const div = convert(ONE);
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
  const [contractedUnits, converter] = expandUnits(
    units,
    nonScalarInversion,
    scalarInversion
  );

  return [contractedUnits ?? units, converter];
}
