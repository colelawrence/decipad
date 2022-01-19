import { getDefined } from '@decipad/utils';
import { identity, F } from '../../utils';
import { Converter } from '.';
import { expandUnits } from './expand-units';
import { Unit, Units } from '../../type';
import { getUnitByName } from '..';

function scalarInversion(convert: Converter): Converter {
  return (n) => {
    const div = convert(F(1));
    return n.div(div);
  };
}

function nonScalarInversion(u: Unit): [Unit, Converter] {
  const knownUnit = getDefined(getUnitByName(u.unit));
  return [u, knownUnit.fromBaseQuantity];
}

export function contractUnits(units: Units | null): [Units | null, Converter] {
  if (units === null) {
    return [null, identity];
  }
  const [, converter] = expandUnits(units, nonScalarInversion, scalarInversion);
  return [units, converter];
}
