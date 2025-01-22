import { formatResultPreview } from '@decipad/format';
import { all, count } from '@decipad/generator-utils';
import { useActiveElement, useResolved } from '@decipad/react-utils';
import { Result } from '@decipad/remote-computer';
import {
  HideColumn,
  MenuItem,
  MenuList,
  PaginationSizeControl,
  Tooltip,
  VariableTypeMenu,
  getTypeIcon,
} from '@decipad/ui';
import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { StyledFooter, StyledInput, StyledTable, TableWrapper } from './styles';
import { Add, CaretDown, Formula, Trash } from 'libs/ui/src/icons';
import { SimpleTableCellType } from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';

export type ChangableTableOptions = {
  formulaColumns: Array<[string, number]>;

  onChangeColumnType: (
    columnName: string,
    type: SimpleTableCellType | undefined
  ) => void;
  onToggleHideColumn: (columnName: string) => void;
  onChangeColumnName: (originalColumnName: string, columnName: string) => void;
};

export type ChangableVariableOptions = {
  onChangeVariableType: (type: SimpleTableCellType | undefined) => void;
};

type CommonTableProps = {
  tableResult: Result.Result<'table'>;
  hiddenColumns: Array<string>;

  formulaColumns: Array<[string, number]>;
  onAddFormula: () => void;
  onChangeFormulaName: (formulaIndex: number, formulaName: string) => void;
  onDeleteFormula: (formulaIndex: number) => void;

  isReadOnly: boolean;
};

export type ConnectionTableProps =
  | ({
      type: 'static';
    } & CommonTableProps)
  | ({
      type: 'allow-changes';
    } & ChangableTableOptions &
      CommonTableProps);

const PAGE_SIZE = 10;

type Cell = { columnName: string; content: string };

const getHtmlRows = (
  table: Result.Result<'table'>,
  columns: Array<Result.ResultMaterializedColumn>
): Array<Array<Cell>> => {
  const rows: Array<Array<Cell>> = [];

  if (columns.length === 0) {
    return rows;
  }

  for (let i = 0; i < columns[0].length; i++) {
    const row: Array<Cell> = [];
    for (let j = 0; j < columns.length; j++) {
      row.push({
        columnName: table.type.columnNames[j],
        content: formatResultPreview({
          type: table.type.columnTypes[j],
          value: columns[j][i]!,
        }),
      });
    }
    rows.push(row);
  }

  return rows;
};

const StaticTableHeader: FC<
  Extract<ConnectionTableProps, { type: 'static' }>
> = ({
  tableResult,
  hiddenColumns,
  formulaColumns,
  onChangeFormulaName,
  onDeleteFormula,
}) => {
  return (
    <thead>
      <tr>
        {tableResult.type.columnNames.map((colName, i) => {
          const Icon = getTypeIcon(tableResult.type.columnTypes[i]);
          // TODO: use a map instead of various arrays [ColumnName -> 'formula' | 'hidden' | 'any-future-state']

          const isColumnHidden = hiddenColumns.some((c) => c === colName);
          const columnFormula = formulaColumns.find(
            ([name]) => name === colName
          );

          if (columnFormula != null) {
            const [columnName, index] = columnFormula;
            return (
              <th key={columnName} scope="col">
                <span>
                  <Formula />
                  <ToggleInput
                    text={columnName}
                    onChangeText={(formulaName) =>
                      onChangeFormulaName(index, formulaName)
                    }
                  />
                  <MenuList root dropdown caret trigger={null}>
                    <MenuItem
                      icon={<Trash />}
                      css={{
                        minWidth: '132px',
                      }}
                      onSelect={() => onDeleteFormula(index)}
                    >
                      Remove Column
                    </MenuItem>
                  </MenuList>
                </span>
              </th>
            );
          }

          return (
            <th key={colName} scope="col" data-hidden={isColumnHidden}>
              <span>
                <Icon /> <span>{colName}</span>
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export const ToggleInput: FC<{
  text: string;
  onChangeText: (_text: string) => void;
}> = ({ text, onChangeText }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(text);

  const inputRef = useRef<HTMLInputElement>(null);

  const formRef = useActiveElement<HTMLFormElement>(() => {
    if (!isEditing) {
      return;
    }

    setIsEditing(false);
    onChangeText(inputText);
  });

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return (
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          setIsEditing(false);
          onChangeText(inputText);
        }}
      >
        <StyledInput
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </form>
    );
  }

  return (
    <span
      onDoubleClick={() => {
        setIsEditing(true);
        setInputText(text);
      }}
    >
      {text}
    </span>
  );
};

const ChangableTableHeader: FC<
  Extract<ConnectionTableProps, { type: 'allow-changes' }>
> = ({
  tableResult,
  hiddenColumns,
  formulaColumns,
  onChangeColumnType,
  onChangeColumnName,
  onToggleHideColumn,
}) => {
  return (
    <thead>
      <tr>
        {tableResult.type.columnNames.map((columnName, i) => {
          const Icon = getTypeIcon(tableResult.type.columnTypes[i]);

          const isColumnHidden = hiddenColumns.some((c) => c === columnName);
          const columnFormula = formulaColumns.find(
            ([name]) => name === columnName
          );

          if (columnFormula != null) {
            return (
              <th key={columnName} scope="col" data-hidden={isColumnHidden}>
                <span>
                  <Formula /> <span>{columnName}</span>
                </span>
              </th>
            );
          }

          return (
            <th key={columnName} scope="col" data-hidden={isColumnHidden}>
              <span>
                <Icon />{' '}
                <ToggleInput
                  text={columnName}
                  onChangeText={(newColumnName) =>
                    onChangeColumnName(columnName, newColumnName)
                  }
                />{' '}
                <VariableTypeMenu
                  trigger={
                    <button
                      data-testid={`table-column-menu-button:${columnName}`}
                    >
                      <CaretDown />
                    </button>
                  }
                  type={tableResult.type.columnTypes[i]}
                  onChangeType={(type) => onChangeColumnType(columnName, type)}
                >
                  <HideColumn
                    isColumnHidden={isColumnHidden}
                    onToggleColumn={() => onToggleHideColumn(columnName)}
                  />
                </VariableTypeMenu>
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

const TableHeader: FC<ConnectionTableProps> = (props) => {
  switch (props.type) {
    case 'static':
      return <StaticTableHeader {...props} />;
    case 'allow-changes':
      return <ChangableTableHeader {...props} />;
  }
};

/**
 * A result component that assumes that a table is grid.
 * This table will not support nested columns, nested tables.
 *
 * It is optimizised by using `display: table` which allows the browser to
 * do a bunch of optimisations when it comes to rendering.
 */
const UnmemoedConnectionTable: FC<ConnectionTableProps> = (props) => {
  const { tableResult, hiddenColumns } = props;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const htmlRows = useResolved(
    useMemo(async () => {
      const rows = await Promise.all(
        tableResult.value.map((column) =>
          all(column((page - 1) * pageSize, page * pageSize))
        )
      );

      return getHtmlRows(tableResult, rows);
    }, [page, pageSize, tableResult])
  );

  const rowCount = useResolved(
    useMemo(async () => {
      if (tableResult.type.rowCount != null) {
        return tableResult.type.rowCount;
      }

      if (tableResult.value.length === 0) {
        return undefined;
      }

      const firstColumn = tableResult.value[0];

      return count(firstColumn());
    }, [tableResult.type.rowCount, tableResult.value])
  );

  if (htmlRows == null || rowCount == null) {
    return null;
  }

  return (
    <TableWrapper>
      <StyledTable contentEditable={false}>
        <TableHeader {...props} />
        <tbody>
          {htmlRows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  data-hidden={hiddenColumns.some((c) => c === cell.columnName)}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {rowCount > 10 && (
          <StyledFooter>
            <tr>
              <td colSpan={tableResult.value.length}>
                <PaginationSizeControl
                  currentPage={page}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onChangePageSize={setPageSize}
                  rowCount={rowCount}
                />
              </td>
            </tr>
          </StyledFooter>
        )}
      </StyledTable>
      {isFlagEnabled('INTEGRATION_FORMULAS') &&
        props.type === 'static' &&
        !props.isReadOnly && (
          <Tooltip
            side="left"
            trigger={
              <div>
                <button onClick={props.onAddFormula}>
                  <Add />
                </button>
              </div>
            }
          >
            Add Column Formula
          </Tooltip>
        )}
    </TableWrapper>
  );
};

export const ConnectionTable = memo(UnmemoedConnectionTable);
