import {
  DataMappingRowElement,
  ELEMENT_DATA_MAPPING,
  ELEMENT_DATA_MAPPING_ROW,
  ELEMENT_STRUCTURED_VARNAME,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, insertNodes } from '@decipad/editor-utils';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { useComputer } from '@decipad/react-contexts';
import {
  IdentifiedResult,
  NotebookResults,
  parseSimpleValue,
} from '@decipad/computer';
import {
  DataMapping as UIDataMapping,
  StructuredInputLines,
} from '@decipad/ui';
import { Children, ComponentProps, useCallback, useMemo } from 'react';
import { nanoid, removeNodes } from '@udecode/plate';
import { DraggableBlock } from '../block-management';
import { getSyntaxError } from '../CodeLine/getSyntaxError';
import { SimpleValueContext, VarResultContext } from '../CodeLine';

const dataMappingResultsDebounceMs = 500;

const getRelevantBlockResults = ({ blockResults }: NotebookResults) =>
  Object.values(blockResults)
    .map((blockResult) => {
      const kind = blockResult.result?.type.kind;
      if (blockResult.type === 'identified-error') return undefined;
      if (
        !(
          kind === 'string' ||
          kind === 'number' ||
          kind === 'boolean' ||
          kind === 'type-error'
        )
      ) {
        return undefined;
      }
      return blockResult;
    })
    .filter((n): n is IdentifiedResult => n !== undefined);

export const DataMapping: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_MAPPING);

  const childrenArray = Children.toArray(children);
  const editor = useTEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const changeSource = usePathMutatorCallback(
    editor,
    path,
    'source',
    'DataMapping'
  );
  const changeSourceType = usePathMutatorCallback(
    editor,
    path,
    'sourceType',
    'DataMapping'
  );
  const changeUnit = usePathMutatorCallback(
    editor,
    path,
    'unit',
    'DataMapping'
  );

  const definedResult = computer.getBlockIdResult$.use(element.id);

  const results = computer.results$.useWithSelectorDebounced(
    dataMappingResultsDebounceMs,
    getRelevantBlockResults
  );
  const bareResults: ComponentProps<typeof UIDataMapping>['results'] = useMemo(
    () =>
      results.map((res) => ({
        id: res.id,
        name: computer.getSymbolDefinedInBlock(res.id) ?? '',
        type: 'notebook-var',
      })),
    [computer, results]
  );

  const allTables: ComponentProps<typeof UIDataMapping>['results'] =
    computer.getAllTables$.useWithSelector((tables) =>
      tables.map((table) => ({
        id: table.id,
        name:
          table.tableName.length === 0
            ? computer.getSymbolDefinedInBlock(table.id) ?? ''
            : table.tableName,
        type:
          table.tableName.length === 0 ? 'live-connection' : 'notebook-table',
      }))
    );

  const allResults = useMemo(
    () =>
      [...bareResults, ...allTables]
        .filter((r) => r.name.length > 0)
        .filter((r) => r.id !== element.id),
    [bareResults, allTables, element.id]
  );

  const tableColumns = computer.getAllColumns$.use(element.source);

  const [, lineResult] = computer.getBlockIdResult$.useWithSelectorDebounced(
    dataMappingResultsDebounceMs,
    (line) => [getSyntaxError(line), line] as const,
    element.id
  );

  const addMapping = useCallback(() => {
    if (!path) return;

    insertNodes(
      editor,
      {
        id: nanoid(),
        type: ELEMENT_DATA_MAPPING_ROW,
        sourceColumn: null,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: `Column${element.children.length}` }],
          },
        ],
      },
      {
        at: [...path, element.children.length],
      }
    );
  }, [editor, element.children.length, path]);

  const onSelectSource = useCallback(
    (
      sourceId: string,
      sourceType: ComponentProps<typeof UIDataMapping>['sourceType']
    ) => {
      changeSource(sourceId);
      changeSourceType(sourceType);

      if (!path) return;

      if (element.children.length > 1) {
        for (let i = 1; i < element.children.length; i += 1) {
          removeNodes(editor, {
            at: [...path, 1],
          });
        }
      }

      if (sourceType === 'notebook-var') return;

      const availableColumns = computer.getAllColumns$.get(sourceId);

      let counter = 1;
      for (const column of availableColumns) {
        insertNodes<DataMappingRowElement>(
          editor,
          {
            id: nanoid(),
            type: ELEMENT_DATA_MAPPING_ROW,
            sourceColumn:
              sourceType === 'notebook-table'
                ? column.blockId!
                : column.columnName,
            children: [
              {
                id: nanoid(),
                type: ELEMENT_STRUCTURED_VARNAME,
                children: [{ text: `Column${counter}` }],
              },
            ],
          },
          {
            at: [...path, 1],
          }
        );
        counter += 1;
      }
    },
    [
      changeSource,
      changeSourceType,
      computer.getAllColumns$,
      editor,
      element.children.length,
      path,
    ]
  );

  const isTable = element.sourceType && element.sourceType !== 'notebook-var';

  const sourceName =
    element.sourceType === 'notebook-var'
      ? bareResults.find((res) => res.id === element.source)?.name
      : element.sourceType === 'live-connection'
      ? allTables.find((res) => res.name === element.source)?.name
      : allTables.find((res) => res.id === element.source)?.name;

  // HACK: To display the right colour on the varname, we give it a dummy simple value.
  const dummySimpleValue = useMemo(() => parseSimpleValue('0'), []);

  return (
    <DraggableBlock element={element} blockKind="structured" {...attributes}>
      <StructuredInputLines>
        <UIDataMapping
          sourceName={sourceName ?? '-----'}
          sourceType={element.sourceType}
          result={definedResult?.result}
          unit={element.unit}
          onChangeUnit={changeUnit}
          results={allResults}
          columnLength={isTable ? tableColumns.length : 0}
          nameChild={
            <SimpleValueContext.Provider value={dummySimpleValue}>
              <VarResultContext.Provider value={lineResult}>
                {childrenArray[0]}
              </VarResultContext.Provider>
            </SimpleValueContext.Provider>
          }
          rowChildren={childrenArray.slice(1)}
          onSelectSource={onSelectSource}
          onAddMapping={addMapping}
        />
      </StructuredInputLines>
    </DraggableBlock>
  );
};
