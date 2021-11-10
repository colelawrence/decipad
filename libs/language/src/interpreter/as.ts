import { singular } from 'pluralize';
import { Realm } from './Realm';
import { Expression, Units } from '../parser/ast-types';
import { convertTimeQuantityTo, Time } from '../date';
import { evaluate } from './evaluate';
import { fromJS, Value, TimeQuantity } from './Value';
import { stringifyUnits } from '../type/units';
import { convertBetweenUnits } from '../units';

export async function evaluateAs(
  realm: Realm,
  expression: Expression,
  units: Units
): Promise<Value> {
  const evalResult = await evaluate(realm, expression);

  if (units.args.length > 1) {
    throw new TypeError(
      `Don't know how to convert to composed unit ${stringifyUnits(units)}`
    );
  }

  const targetUnitAsString = units.args[0].unit;
  const expressionType = realm.getTypeAt(expression);

  if (expressionType.timeUnits) {
    return fromJS(
      convertTimeQuantityTo(
        evalResult as TimeQuantity,
        singular(targetUnitAsString) as Time.Unit
      )
    );
  }

  if (expressionType.isScalar('number')) {
    const sourceUnits = expressionType.unit;
    if (!sourceUnits || sourceUnits.args.length < 1) {
      return evalResult;
    }
    if (sourceUnits.args.length > 1) {
      throw new TypeError(
        `Don't know how to convert to composed units ${stringifyUnits(
          sourceUnits
        )}`
      );
    }
    return fromJS(
      convertBetweenUnits(
        evalResult.getData() as number,
        sourceUnits.args[0].unit,
        targetUnitAsString
      )
    );
  }

  throw new TypeError(
    `Don't know how to convert value to ${stringifyUnits(units)}`
  );
}
