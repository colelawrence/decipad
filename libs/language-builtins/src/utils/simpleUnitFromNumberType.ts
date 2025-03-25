import { Type } from '@decipad/language-interfaces';

export const simpleUnitFromNumberType = (
  type: Type
): [Type, string | undefined] => {
  if (!type.unit || type.unit.length !== 1) {
    return [type.withErrorCause(`invalid time unit`), undefined];
  }
  return [type, type.unit[0].unit.toLocaleLowerCase()];
};
