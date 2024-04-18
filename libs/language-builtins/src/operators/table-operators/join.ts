/* eslint-disable no-await-in-loop */
// eslint-disable-next-line no-restricted-imports
import { Type, Value, buildType } from '@decipad/language-types';
import type { FullBuiltinSpec } from '../../interfaces';
import { getDefined, produce, unique } from '@decipad/utils';
import type { BuiltinContextUtils } from '../../types';
import { joinedTable } from './renderJoinedTable';

const gatherSourceTables = async (
  columnType: Type,
  utils: BuiltinContextUtils
): Promise<Type[]> => {
  const sourceTables: Type[] = [];
  let column = columnType;

  while ((await column.isScalar('boolean')).errorCause != null) {
    const sourceType =
      column.indexedBy != null
        ? await utils.retrieveIndexByName(column.indexedBy)?.isTable()
        : undefined;
    if (sourceType == null) {
      return [buildType.impossible('Could not find table to join on')];
    }
    const sourceTable = await sourceType.isTable();
    if (sourceTable.errorCause) {
      return [sourceTable];
    }
    sourceTables.push(sourceTable);
    column = await column.reduced();
  }

  if (sourceTables.length < 1) {
    return [buildType.impossible('Could not find table to join on')];
  }

  return unique(sourceTables);
};

const concatTableTypes = (tables: Type[], utils: BuiltinContextUtils): Type =>
  tables.reduce((resultTable, sourceTable) =>
    sourceTable.errorCause
      ? sourceTable
      : produce(resultTable, (table) => {
          table.columnTypes = getDefined(table.columnTypes).concat(
            getDefined(sourceTable.columnTypes)
          );
          table.columnNames = getDefined(table.columnNames).concat(
            getDefined(sourceTable.columnNames).map(
              (name) =>
                `${utils.retrieveHumanVariableNameByGlobalVariableName(
                  sourceTable.indexName ?? ''
                )}_${name}`
            )
          );
        })
  );

export const joinFunctorNoAutomap: FullBuiltinSpec['functorNoAutomap'] = async (
  [conditionType],
  _,
  utils
) =>
  (
    await Type.combine(
      conditionType.isColumn(),
      (await conditionType.reducedToLowest()).isScalar('boolean')
    )
  ).mapType(async () =>
    concatTableTypes(await gatherSourceTables(conditionType, utils), utils)
  );

export const joinValuesNoAutomap: FullBuiltinSpec['fnValuesNoAutomap'] = async (
  [condition],
  [conditionType],
  utils
) => {
  const sourceTableTypes = await gatherSourceTables(conditionType, utils);
  const sourceTables = sourceTableTypes.map((type) =>
    getDefined(
      utils.retrieveVariableValueByGlobalVariableName(
        getDefined(type.indexName)
      ),
      `Could not find table with name ${type.indexName}`
    )
  );

  const resultTableType = concatTableTypes(sourceTableTypes, utils);

  return joinedTable(
    sourceTables,
    sourceTableTypes,
    resultTableType,
    Value.getColumnLike(condition)
  );
};
