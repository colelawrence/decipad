import type { Realm } from '../interpreter';

/** If the typecheck failed, we don't execute */
export const shouldEvaluate = (
  realm: Realm,
  tableName: string,
  columnName: string
) => {
  const type = realm.inferContext.stack.getNamespaced([tableName, columnName]);
  return type != null && type.errorCause == null;
};
