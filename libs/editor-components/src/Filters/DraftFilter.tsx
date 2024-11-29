import { BlockResult, IdentifiedResult } from '@decipad/computer-interfaces';
import { useComputer } from '@decipad/editor-hooks';
import {
  ELEMENT_INTEGRATION,
  IntegrationTypes,
  type Filter,
} from '@decipad/editor-types';
import {
  Button,
  cssVar,
  DropdownField,
  InputField,
  MenuItem,
} from '@decipad/ui';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Result } from '@decipad/language-interfaces';
import { assert } from '@decipad/utils';
import { isEmpty, omit } from 'lodash';
import { elementFilters } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { css } from '@emotion/react';
import DeciNumber from '@decipad/number';
import { SerializedFilter } from 'libs/editor-types/src/integrations';

export type DraftFilter = Partial<{
  id: string;
  filterName: string;
  columnId: string;
  type: 'string' | 'number' | 'date';
  value: string;
  integrationId: string;
  integrationName: string;
  columnName: string;
}>;

type TableResult = {
  varName: string;
  id: string;
  result: Result.Result<'table'>;
};

export const newFilterSymbol = Symbol('newFilter');
export type NewFilterSymbol = typeof newFilterSymbol;

export const buttonContainerStyles = css({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: '16px',
  paddingLeft: 4,
  '> button': {
    flex: '0 0 auto',
    padding: 0,
    fontWeight: 400,
  },
});

const newFilterStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  background: cssVar('backgroundDefault'),
  padding: '12px 8px',
  borderRadius: '8px',
});

type Errors = Partial<{
  filterName: string;
  column: string;
  value: string;
}>;

export const DraftFilterForm = ({
  filter,
  setDraftFilter,
  closeForm,
}: {
  filter: DraftFilter;
  setDraftFilter: Dispatch<SetStateAction<DraftFilter>>;
  closeForm: () => void;
}) => {
  const computer = useComputer();
  const controller = useNotebookWithIdState((s) => s.controller!);
  const [errors, setErrors] = useState<Errors>({});

  const tableResults: TableResult[] = computer.results$.useWithSelector(
    (results) => {
      const integrationResults: {
        varName: string;
        id: string;
        result: Result.Result<'table'>;
      }[] = [];
      Object.values(results.blockResults)
        .filter((block: BlockResult): block is IdentifiedResult => {
          return (
            block.type === 'computer-result' &&
            block.result.type.kind === 'table'
          );
        })
        .forEach((block) => {
          const resultKind = block.result.type.kind;
          const integrationName = computer.getSymbolDefinedInBlock(block.id);
          if (
            integrationName &&
            (resultKind === 'table' || resultKind === 'materialized-table')
          ) {
            // Could just check for integrationName, but for clarity...
            integrationResults.push({
              id: block.id,
              varName: integrationName,
              result: block.result as Result.Result<'table'>,
            });
          }
        });
      return integrationResults;
    }
  );

  let inputFieldType: Parameters<typeof InputField>[0]['type'];

  // If the ref changes, we need to recompute columnName and integrationName
  const filterIdRef = useRef(filter.id);
  useEffect(() => {
    const hasNames = filter.columnName && filter.integrationName;
    const hasSelectedColumn = filter.columnId && filter.integrationId;
    if ((hasSelectedColumn && !hasNames) || filterIdRef.current !== filter.id) {
      const columnKeys = tableResults.flatMap(({ varName, result }) => {
        return result.type.columnNames.map((colName) => {
          return `${varName}.${colName}`;
        });
      });

      const selectedKey = columnKeys.find(
        (key) => computer.getVarBlockId(key) === filter.columnId
      );
      const [integrationName, columnName] = selectedKey?.split('.') ?? [];
      setDraftFilter((f) => ({
        ...f,
        columnName,
        integrationName,
      }));

      filterIdRef.current = filter.id;
    }
  }, [filter, tableResults, filterIdRef, computer, setDraftFilter]);

  const tableIds = tableResults.map(({ id }) => id);

  // TODO: Doesn't find anything unless integrations are refreshed on page load :/
  const columns = computer.getNamesDefined$.use().filter((x) => {
    return x.kind === 'column' && tableIds.includes(x.blockId as string);
  });

  const types = Object.fromEntries(
    columns.map((column) => {
      const key = column.name;
      return [key, column.serializedType] as const;
    })
  );

  const handleSave = useCallback(() => {
    const {
      filterName,
      columnId,
      integrationName,
      columnName,
      integrationId,
      value,
    } = filter;

    const validationErrors: Errors = {};
    if (!filterName || filterName?.trim() === '') {
      validationErrors.filterName = 'Filter name is required';
    }
    if (columnId == null || integrationId == null) {
      validationErrors.column = 'Column is required';
    }
    switch (typeof value) {
      case 'string':
        if (value.trim() === '') {
          validationErrors.value = 'Value is required';
        }
        break;
      case 'undefined':
        validationErrors.value = 'Value is required';
    }

    if (!isEmpty(validationErrors)) {
      setErrors(validationErrors);
      return;
    }
    assert(
      filterName != null &&
        columnId != null &&
        integrationId != null &&
        value != null
    );

    const integrationEntry = controller.getEntryFromId(integrationId);

    assert(integrationEntry != null);
    const [block, path] = integrationEntry;
    if (block.type !== ELEMENT_INTEGRATION) {
      throw new Error('Invalid integration type');
    }

    if (filter.value === undefined) {
      throw new Error('Filter value is undefined');
    }
    const id = filter.id ?? nanoid();
    let newFilter: Filter;
    switch (filter.type) {
      case 'string': {
        newFilter = {
          id,
          filterName,
          columnId,
          type: 'string',
          value: filter.value,
        };
        break;
      }
      case 'number': {
        newFilter = {
          id,
          filterName,
          columnId,
          type: 'number',
          value: new DeciNumber(filter.value),
        };
        break;
      }
      case 'date': {
        const column = computer.getVarResult$.get(
          `${integrationName}.${columnName}`
        );
        if (column?.type !== 'computer-result') {
          throw new Error('Invalid integration');
        }
        const type = column?.result?.type;
        const colType = type?.kind === 'column' ? type.cellType : undefined;
        if (colType?.kind !== 'date') {
          throw new Error('Invalid column type');
        }

        newFilter = {
          id,
          filterName,
          columnId,
          type: 'date',
          value: {
            time: new Date(filter.value).getTime(),
            specificity: colType.date,
          },
        };
        break;
      }
      default:
        // I'm not sure why this has to be here, but according to TS it does.
        throw new Error('Invalid filter type');
    }

    const filters: Filter[] = filter.id
      ? elementFilters(block).map((f): Filter => {
          if (f.id !== filter.id) {
            return f;
          }
          if (typeof filter.value !== 'string') {
            throw new Error('Invalid filter value');
          }
          return newFilter;
        })
      : [...elementFilters(block), newFilter];

    controller.apply({
      type: 'set_node',
      path,
      properties: omit(
        block,
        'children'
      ) satisfies Partial<IntegrationTypes.IntegrationBlock>,
      // Warning: here be yolo types
      newProperties: {
        ...omit(block, 'children'),
        filters: filters as SerializedFilter[],

        // You need to update timeOfLastRun for the integration to refresh automatically.
        timeOfLastRun: Date.now().toString(),
      } satisfies Partial<IntegrationTypes.IntegrationBlock>,
    });

    closeForm();
  }, [filter, controller, computer.getVarResult$, closeForm]);

  switch (types[`${filter.integrationName}.${filter.columnName}`]?.kind) {
    case 'date':
      inputFieldType = 'date';
      break;
    case 'number':
      inputFieldType = 'number';
      break;
    default:
      inputFieldType = 'text';
  }

  const noValueSelected = !filter.integrationName || !filter.columnName;

  return (
    <div css={newFilterStyles}>
      <InputField
        autoFocus
        required
        error={errors.filterName}
        size="small"
        label="Filter Name"
        name="filter-name"
        placeholder="Name value"
        value={filter.filterName}
        onChange={(text) =>
          setDraftFilter((dFilter = {}) => {
            return {
              ...dFilter,
              filterName: text,
            };
          })
        }
        testId="draft-filter-name"
      />

      <DropdownField
        label="Column"
        error={errors.column}
        triggerText={
          filter.integrationName && filter.columnName
            ? `${filter.integrationName}.${filter.columnName}`
            : 'Select a column'
        }
        noValueSelected={noValueSelected}
      >
        {tableResults.flatMap(({ varName, id, result }) => {
          return result.type.columnNames
            .map((colName) => {
              const key = `${varName}.${colName}`;
              const columnId = computer.getVarBlockId(key);
              return [columnId, key, colName];
            })
            .filter(([columnId]) => columnId)
            .map(([columnId, key, colName]) => {
              return (
                <MenuItem
                  key={key}
                  onSelect={() =>
                    setDraftFilter((dFilter): DraftFilter => {
                      return {
                        ...dFilter,
                        columnId,
                        columnName: colName,
                        integrationName: varName,
                        integrationId: id,
                      };
                    })
                  }
                  selected={filter?.columnId === key}
                >
                  {varName}.{colName}
                </MenuItem>
              );
            });
        })}
      </DropdownField>

      <InputField
        required
        size="small"
        type={inputFieldType}
        error={errors.value}
        label="Value"
        name="filter-value"
        placeholder="Filter value"
        value={filter.value?.toString()}
        onChange={(text) => {
          setDraftFilter((dFilter: DraftFilter) => {
            let type: DraftFilter['type'];
            switch (inputFieldType) {
              case 'number':
              case 'date':
                type = inputFieldType;
                break;
              case 'text':
                type = 'string';
                break;
              default: {
                throw new Error('Invalid input field type');
              }
            }
            return {
              ...dFilter,
              type,
              value: text,
            };
          });
        }}
        testId="draft-filter-value"
      />

      <div css={buttonContainerStyles}>
        <Button type="text" onClick={handleSave}>
          Save filter
        </Button>
        <Button type="text" onClick={closeForm}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
