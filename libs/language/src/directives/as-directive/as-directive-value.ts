/* eslint-disable no-restricted-imports */
import {
  Unit as TUnit,
  AST,
  Type,
  Value as ValueTypes,
} from '@decipad/language-interfaces';
import DeciNumber, { DeciNumberBase, N, UNDEFINED } from '@decipad/number';
import {
  produce,
  getDefined,
  getInstanceof,
  PromiseOrType,
} from '@decipad/utils';
import {
  Dimension,
  InferError,
  RuntimeError,
  Unit,
  Value,
  convertBetweenUnits,
  isErrorType,
} from '@decipad/language-types';
import { evaluate } from '../../interpreter';
import { DirectiveImpl } from '../types';
import { coerceValue } from '../../type-coercion';
import { inferExpression } from '../../infer/infer';
import { TScopedRealm } from '../../scopedRealm';
import { UnknownValue } from 'libs/language-types/src/Value';
import { representsPercentage } from './utils/representsPercentage';
import { isTypeCoercion } from './utils/isTypeCoercion';
import { singleUnitRef } from './utils/singleUnitRef';
import { AsDirective } from 'libs/language-interfaces/src/AST';

function multiplyUnitMultipliers(
  units: TUnit[] | null | undefined
): DeciNumber {
  return (units || []).reduce(
    (acc, unit) => acc.mul(unit.multiplier.pow(unit.exp)),
    N(1)
  );
}

function multiplyUnitMultipliersIfNeedsEnforcing(
  units: TUnit[] | null | undefined
): DeciNumber {
  return (units || []).reduce(
    (acc, unit) =>
      unit.enforceMultiplier ? acc.mul(unit.multiplier.pow(unit.exp)) : acc,
    N(1)
  );
}

function inlineUnitAliases(units: TUnit[] | null): TUnit[] | null {
  if (!units) {
    return null;
  }
  return units.reduce<TUnit[]>((units, oneUnit) => {
    if (oneUnit.aliasFor != null) {
      const unit = getDefined(inlineUnitAliases(oneUnit.aliasFor));
      for (const u of unit) {
        units.push(
          produce(u, (unit) => {
            unit.enforceMultiplier = true;
          })
        );
      }
    } else {
      units.push(oneUnit);
    }
    return units;
  }, []);
}

type ValueToPercentage = (
  values: ValueTypes.Value[],
  targetTypes: Type[]
) => PromiseOrType<ValueTypes.Value>;

const numberToPercentage: ValueToPercentage = (
  [value]: ValueTypes.Value[],
  [targetType]: Type[]
) => {
  const noMultiplier = Unit.convertToMultiplierUnit(
    getInstanceof(value, Value.NumberValue).value,
    targetType.unit
  );
  return Value.NumberValue.fromValue(noMultiplier);
};

type UnitConverter = (
  targetUnits: TUnit[] | null,
  sourceUnits: TUnit[] | null,
  conversionRate: DeciNumberBase,
  defaultValue: ValueTypes.Value
) => (values: ValueTypes.Value[], types: Type[]) => Promise<ValueTypes.Value>;

const convertNumberUnits: UnitConverter =
  (
    targetUnits: TUnit[] | null,
    sourceUnits: TUnit[] | null,
    conversionRate: DeciNumberBase,
    defaultValue: ValueTypes.Value
  ) =>
  async ([value]: ValueTypes.Value[]) => {
    if (value instanceof Value.NumberValue) {
      if (!targetUnits || !sourceUnits || sourceUnits.length < 1) {
        return Value.fromJS(
          (await value.getData()).div(conversionRate),
          defaultValue
        );
      }

      const converted = convertBetweenUnits(
        await value.getData(),
        sourceUnits,
        targetUnits,
        { tolerateImprecision: true }
      );

      return Value.fromJS(converted.div(conversionRate), defaultValue);
    }

    throw targetUnits
      ? InferError.cannotConvertToUnit(targetUnits)
      : new RuntimeError(
          `Don't know how to convert value to ${value?.getData()?.toString()}`
        );
  };

const getNumberValue = async (
  realm: TScopedRealm,
  root: AST.AsDirective,
  expressionType: Type,
  expression: AST.Expression,
  unitsExpression: AST.Expression,
  convertToPercentage: ValueToPercentage = numberToPercentage,
  convertUnits: UnitConverter = convertNumberUnits
) => {
  const expressionValue = await evaluate(realm, expression);

  if (representsPercentage(unitsExpression)) {
    return Dimension.automapValues(
      realm.utils,
      [expressionType],
      [expressionValue],
      convertToPercentage
    );
  }

  const targetUnitExpressionType = await (
    await inferExpression(realm, unitsExpression)
  ).isScalar('number');
  const { unit: targetUnit } =
    (!isErrorType(targetUnitExpressionType) &&
      (await targetUnitExpressionType.reducedToLowest())) ||
    {};

  // type coercions
  if (targetUnit != null && isTypeCoercion(targetUnit)) {
    return coerceValue(
      realm,
      expressionType,
      expressionValue,
      getDefined(singleUnitRef(targetUnit[0]))
    );
  }

  const returnExpressionType = realm.getTypeAt(root);
  const targetUnitsEvalResult = await evaluate(realm, unitsExpression);
  const targetUnitsData = getInstanceof(
    await targetUnitsEvalResult.getData(),
    DeciNumber,
    `units needs to be a number:`
  );

  const targetUnitsExpressionType = realm.getTypeAt(unitsExpression);
  const targetUnits = inlineUnitAliases(targetUnitsExpressionType.unit);

  const targetUnitsMultiplier = multiplyUnitMultipliers(targetUnits);
  const targetMultiplierConversionRate = targetUnitsData.div(
    targetUnitsMultiplier
  );

  const returnTypeDivider = multiplyUnitMultipliersIfNeedsEnforcing(
    inlineUnitAliases(returnExpressionType.unit)
  );
  const conversionRate = targetMultiplierConversionRate.mul(returnTypeDivider);

  const sourceUnits = inlineUnitAliases(
    (await expressionType.reducedToLowest()).unit
  );

  return Dimension.automapValues(
    realm.utils,
    [expressionType],
    [expressionValue],
    convertUnits(
      targetUnits,
      sourceUnits,
      conversionRate,
      Value.defaultValue(expressionType)
    )
  );
};

const convertTrendToPercentage: ValueToPercentage = async (
  [value]: ValueTypes.Value[],
  [targetType]: Type[]
) => {
  const trendValue = Value.getTrendValue(value);
  const first = await numberToPercentage(
    [Value.Scalar.fromValue(trendValue?.first ?? UNDEFINED)],
    [getDefined(targetType.trendOf)]
  );

  const last = await numberToPercentage(
    [Value.Scalar.fromValue(trendValue?.last ?? UNDEFINED)],
    [getDefined(targetType.trendOf)]
  );

  return Value.Trend.from(
    getInstanceof(await first.getData(), DeciNumber),
    getInstanceof(await last.getData(), DeciNumber)
  );
};

const convertTrendUnits: UnitConverter = (...args) => {
  const numberConverter = convertNumberUnits(...args);
  return async ([value], [type]) => {
    const trendValue = Value.getTrendValue(value);
    const trendOfType = getDefined(type.trendOf);
    const first = await numberConverter(
      [Value.Scalar.fromValue(trendValue?.first ?? UNDEFINED)],
      [trendOfType]
    );
    const last = await numberConverter(
      [Value.Scalar.fromValue(trendValue?.last ?? UNDEFINED)],
      [trendOfType]
    );
    return Value.Trend.from(
      getInstanceof(await first.getData(), DeciNumber),
      getInstanceof(await last.getData(), DeciNumber)
    );
  };
};

const getTrendValue = async (
  realm: TScopedRealm,
  root: AsDirective,
  expressionType: Type,
  expression: AST.Expression,
  unitsExpression: AST.Expression
) =>
  getNumberValue(
    realm,
    root,
    expressionType,
    expression,
    unitsExpression,
    convertTrendToPercentage,
    convertTrendUnits
  );

export const getValue: DirectiveImpl<AST.AsDirective>['getValue'] = async (
  realm,
  root
): Promise<ValueTypes.Value> => {
  const [, expression, unitsExpression] = root.args;
  const expressionType = realm.getTypeAt(expression);

  if (expressionType.errorCause) {
    return UnknownValue;
  }
  const reducedToLowest = await expressionType.reducedToLowest();
  if (reducedToLowest.trendOf) {
    return getTrendValue(
      realm,
      root,
      expressionType,
      expression,
      unitsExpression
    );
  }

  return getNumberValue(
    realm,
    root,
    expressionType,
    expression,
    unitsExpression
  );
};
