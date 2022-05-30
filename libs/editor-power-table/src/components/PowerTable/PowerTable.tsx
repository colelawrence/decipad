import { useCallback, useEffect, useMemo, useState } from 'react';
import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_POWER_TABLE,
  ELEMENT_POWER_TR,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  matchNodeType,
  useElementMutatorCallback,
  useNamesDefinedBefore,
} from '@decipad/editor-utils';
import { organisms, AvailableSwatchColor, UserIconKey } from '@decipad/ui';
import { useEditorChange, useExpressionResult } from '@decipad/react-contexts';
import {
  AST,
  AutocompleteName,
  Interpreter,
  SerializedType,
} from '@decipad/computer';
import { findNode, findNodePath } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import { usePowerTableActions, useSortColumns } from '../../hooks';
import { PowerTableData } from '../PowerTableData';
import { Columns } from '../../types';

const isTable = (name: AutocompleteName): boolean => name.type.kind === 'table';
const varName = (name: AutocompleteName): string => name.name;

export const PowerTable: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_POWER_TABLE);
  const [deleted, setDeleted] = useState(false);
  const editor = useTEditorRef();

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');

  const { onDelete, onVariableNameChange, setDataColumns, columnChanges$ } =
    usePowerTableActions(editor, element);

  const variableNames = useNamesDefinedBefore(element.id, false);
  const expression: AST.Expression | undefined = useMemo(
    () =>
      element.varName
        ? {
            type: 'ref',
            args: [element.varName],
          }
        : undefined,
    [element.varName]
  );

  const result = useExpressionResult(expression);

  let data: Interpreter.ResultTable | undefined;
  let columnNames: string[] | undefined;
  let columnTypes: SerializedType[] | undefined;

  if (result?.type.kind === 'table' && result.value) {
    data = result.value as Interpreter.ResultTable;
    columnNames = result?.type.columnNames;
    columnTypes = result?.type.columnTypes;
  }

  useEffect(() => {
    // add missing columns and remove surplus columns from power table
    if (columnTypes && columnNames) {
      const types = columnTypes;
      const names = columnNames;
      if (types.length !== names.length) {
        throw new Error(
          'Expected column types and names to be of the same length'
        );
      }
      setDataColumns(
        types.map((type, index) => ({
          type,
          name: names[index],
        }))
      );
    }
  }, [columnNames, columnTypes, setDataColumns]);

  // sort column names and types according to user preferences

  const [sortedColumns, setSortedColumns] = useState<Columns | undefined>();

  const sortColumns = useSortColumns({
    columnNames,
    columnTypes,
    data,
    sortedColumns,
    setSortedColumns,
  });

  const editorSelector = useCallback((): number[] | undefined => {
    if (!columnTypes || !columnNames) {
      return;
    }
    const tablePath = findNodePath(editor, element);
    if (tablePath) {
      const columnRowEntry = findNode(editor, {
        at: tablePath,
        match: matchNodeType(ELEMENT_POWER_TR),
      });
      if (columnRowEntry) {
        const [columnRow] = columnRowEntry;
        assertElementType(columnRow, ELEMENT_POWER_TR);
        const columnHeaders = columnRow.children;
        return columnHeaders.map((column) =>
          getDefined(columnNames).indexOf(column.name)
        );
      }
    }
    return undefined;
  }, [columnNames, columnTypes, editor, element]);

  useEditorChange(sortColumns, editorSelector, {
    injectObservable: columnChanges$,
  });

  return (
    <div {...attributes}>
      {!deleted && (
        <DraggableBlock
          element={element}
          blockKind="editorTable"
          onDelete={() => {
            setDeleted(true);
            onDelete();
          }}
        >
          <organisms.PowerTable
            availableVariableNames={variableNames.filter(isTable).map(varName)}
            variableName={element.varName || ''}
            onChangeVariableName={onVariableNameChange}
            onChangeIcon={saveIcon}
            onChangeColor={saveColor}
            icon={(element.icon ?? 'Table') as UserIconKey}
            color={(element.color ?? 'Catskill') as AvailableSwatchColor}
            data={
              sortedColumns && (
                <PowerTableData
                  data={sortedColumns[2]}
                  columnTypes={sortedColumns[1]}
                />
              )
            }
          >
            {children}
          </organisms.PowerTable>
        </DraggableBlock>
      )}
    </div>
  );
};
