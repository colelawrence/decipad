import { useEffect, useMemo, useRef } from 'react';
import { DataViewElement } from '@decipad/editor-types';
import {
  type ProgramBlock,
  type Result,
  astNode,
  serializeType,
  deserializeType,
  buildType,
} from '@decipad/computer';
import { AggregationKind, DataGroup } from '../types';
import { useComputer } from '@decipad/react-contexts';
import { dequal } from '@decipad/utils';
import { useGroupsToColumns } from './useGroupsToColumns';

export interface UsePushDataViewToComputerOptions {
  element: DataViewElement;
  groups: DataGroup[] | undefined;
  dataViewName: string;
  tableName?: string;
  aggregationTypes: (AggregationKind | undefined)[];
  roundings: Array<string | undefined>;
}

export const usePushDataViewToComputer = ({
  element,
  groups = [],
  dataViewName,
  tableName,
  aggregationTypes,
  roundings,
}: UsePushDataViewToComputerOptions): void => {
  const computer = useComputer();
  const columns = useGroupsToColumns({
    computer,
    tableName,
    groups: useMemo(() => {
      // remove last group if it is a smart row
      if (groups[groups.length - 1]?.elementType === 'smartrow') {
        return groups.slice(0, -1);
      }
      return groups;
    }, [groups]),
    aggregationTypes,
    roundings,
  });
  const computeDeps = useMemo(
    () => [
      columns,
      groups,
      tableName,
      aggregationTypes,
      roundings,
      dataViewName,
    ],
    [aggregationTypes, columns, groups, roundings, tableName, dataViewName]
  );
  const lastPushed = useRef(computeDeps);

  useEffect(() => {
    if (tableName) {
      if (dequal(computeDeps, lastPushed.current)) {
        // IMPORTANT: keeps the computer from triggering a data view change and cycle
        return;
      }

      lastPushed.current = computeDeps;
      (async () => {
        const blockId = element.id;
        // send the result to the computer

        const externalDatas = [] as [string, Result.Result][];
        const programBlocks: ProgramBlock[] = [
          // Table = {}
          {
            type: 'identified-block',
            id: blockId,
            block: {
              id: blockId,
              type: 'block',
              args: [astNode('table', astNode('tabledef', dataViewName))],
            },
            definesVariable: dataViewName,
            isArtificial: true,
          },
        ];
        let index = -1;
        for (const { type: colType, name: colName, value } of columns) {
          index += 1;
          const dataRef = `${blockId}--${index}`;

          // Table.Column = {Data}
          programBlocks.push({
            type: 'identified-block',
            id: dataRef,
            block: {
              id: dataRef,
              type: 'block',
              args: [
                astNode(
                  'table-column-assign',
                  astNode('tablepartialdef', dataViewName),
                  astNode('coldef', colName),
                  astNode('externalref', dataRef)
                ),
              ],
            },
            definesTableColumn: [dataViewName, colName],
            isArtificial: true,
            artificiallyDerivedFrom: blockId,
          });

          externalDatas.push([
            dataRef,
            {
              type: serializeType(
                buildType.column(deserializeType(colType), dataViewName, index)
              ),
              value,
            },
          ]);
        }

        computer.pushExternalDataUpdate(blockId, externalDatas);
        computer.pushExtraProgramBlocks(blockId, programBlocks);
      })();
    }
  }, [
    columns,
    computeDeps,
    computer,
    dataViewName,
    element.children,
    element.id,
    tableName,
  ]);
};
