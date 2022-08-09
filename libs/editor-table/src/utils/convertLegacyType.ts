import { SerializedType, Unit } from '@decipad/computer';

type LegacyUnits = { type: 'units'; args: Unit[] };
const isLegacyUnitObject = (
  unit: Unit[] | LegacyUnits | null | undefined
): unit is LegacyUnits =>
  unit != null &&
  'type' in unit &&
  'args' in unit &&
  unit.type === 'units' &&
  Array.isArray(unit.args);

export const convertLegacyType = (
  type: SerializedType
): SerializedType | undefined => {
  /* Keep up with the august 2022 language refactor that changed number units */
  if (type.kind === 'number' && isLegacyUnitObject(type.unit)) {
    return { kind: 'number', unit: type.unit.args };
  }

  return undefined;
};
