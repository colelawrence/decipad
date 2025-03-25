import { Type } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Time } from '@decipad/language-types';
import { simpleUnitFromNumberType } from './simpleUnitFromNumberType';

export const timeUnitFromNumberType = (
  type: Type
): [Type, Time.Specificity | undefined] => {
  const [resultType, unitName] = simpleUnitFromNumberType(type);
  if (resultType.errorCause) {
    return [resultType, undefined];
  }
  if (!Time.isTimeSpecificity(unitName)) {
    return [type.withErrorCause(`invalid time unit ${unitName}`), undefined];
  }
  return [type, unitName];
};
