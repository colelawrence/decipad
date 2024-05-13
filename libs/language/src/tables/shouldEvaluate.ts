// eslint-disable-next-line no-restricted-imports
import { isErrorType } from '@decipad/language-types';
import type { TRealm } from '../scopedRealm';

/** If the typecheck failed, we don't execute */
export const shouldEvaluate = (
  realm: TRealm,
  tableName: string,
  columnName: string
) => {
  const type = realm.inferContext.stack.getNamespaced([tableName, columnName]);
  return type != null && !isErrorType(type);
};
