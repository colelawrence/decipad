import { BlockResult, IdentifiedResult } from '@decipad/computer-interfaces';
import { useComputer } from '@decipad/editor-hooks';
import { ELEMENT_INTEGRATION, type Filter } from '@decipad/editor-types';
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

export type DraftFilter = Partial<
  Filter & {
    integrationId: string;
    integrationName: string;
    columnName: string;
  }
>;

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
}: {
  filter: DraftFilter;
  setDraftFilter: Dispatch<SetStateAction<DraftFilter | undefined>>;
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

  const handleSave = useCallback(() => {
    const { filterName, columnId, integrationId, value } = filter;

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

    const newFilter = {
      id: filter.id ?? nanoid(),
      columnId,
      filterName,
      value,
    };

    const filters: Filter[] = filter.id
      ? elementFilters(block).map((f): Filter => {
          return f.id === filter.id
            ? ({
                id: filter.id,
                filterName: filter.filterName,
                columnId: filter.columnId,
                value: filter.value,
              } as Filter)
            : f;
        })
      : [...elementFilters(block), newFilter];

    controller.apply({
      type: 'set_node',
      path,
      properties: omit(block, 'children'),
      // Warning: here be yolo types
      newProperties: {
        ...omit(block, 'children'),
        filters,
      },
    });

    setDraftFilter(undefined);
  }, [filter, setDraftFilter, controller]);

  const types = Object.fromEntries(
    tableResults.flatMap(({ varName, result }) => {
      return result.type.columnNames.map((colName) => {
        const key = `${varName}.${colName}`;
        const varResult = computer.getVarResult$.use(key);

        const type = varResult?.result?.type;
        const colType = type?.kind === 'column' ? type.cellType : undefined;

        return [key, colType?.kind] as const;
      });
    })
  );

  let inputFieldType: Parameters<typeof InputField>[0]['type'];
  switch (types[`${filter.integrationName}.${filter.columnName}`]) {
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
          switch (inputFieldType) {
            case 'number':
              return setDraftFilter((dFilter) => {
                return {
                  ...dFilter,
                  value: new DeciNumber(text),
                };
              });
            case 'text':
              return setDraftFilter((dFilter) => {
                return {
                  ...dFilter,
                  value: text,
                };
              });
            default:
              return setDraftFilter((dFilter) => {
                return {
                  ...dFilter,
                  value: text,
                };
              });
          }
        }}
        testId="draft-filter-value"
      />

      <div css={buttonContainerStyles}>
        <Button type="text" onClick={handleSave}>
          Save filter
        </Button>
        <Button type="text" onClick={() => setDraftFilter(undefined)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
