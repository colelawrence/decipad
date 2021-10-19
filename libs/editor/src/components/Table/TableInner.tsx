import { FC } from 'react';

import {
  BodyTrElement,
  CaptionElement,
  HeadTrElement,
  TableElement,
  TdElement,
  ThElement,
  EditableCellContents,
} from '@decipad/ui';

import {
  changeVariableName,
  addColumn,
  addRow,
  changeCell,
  changeColumnName,
  removeRow,
  changeColumnType,
  validateCell,
} from './actions';
import { TableData } from './types';

interface TableInnerProps {
  value: TableData;
  onChange: (newData: TableData) => void;
}

/** Table without slate bindings */
export const TableInner = ({
  value,
  onChange,
}: TableInnerProps): ReturnType<FC> => {
  const tableLength = value.columns[0].cells.length;

  return (
    <TableElement
      onAddRow={() => {
        onChange(addRow(value));
      }}
    >
      <CaptionElement>
        <EditableCellContents
          value={value.variableName}
          onChange={(newVariableName) => {
            onChange(changeVariableName(value, newVariableName));
          }}
          validate={() => true}
        ></EditableCellContents>
      </CaptionElement>
      <thead>
        <HeadTrElement
          onAddColumn={() => {
            onChange(addColumn(value));
          }}
        >
          {value.columns.map((col, columnIndex) => {
            return (
              <ThElement
                onChangeColumnType={(newType) => {
                  onChange(changeColumnType(value, columnIndex, newType));
                }}
                key={columnIndex}
              >
                <EditableCellContents
                  value={col.columnName}
                  onChange={(newColumnName) => {
                    onChange(
                      changeColumnName(value, columnIndex, newColumnName)
                    );
                  }}
                />
              </ThElement>
            );
          })}
        </HeadTrElement>
      </thead>
      <tbody>
        {Array.from({ length: tableLength }, (_, rowIndex) => {
          return (
            <BodyTrElement
              key={rowIndex}
              onRemove={() => {
                onChange(removeRow(value, rowIndex));
              }}
            >
              {value.columns.map((column, colIndex) => {
                return (
                  <TdElement key={colIndex}>
                    <EditableCellContents
                      value={column.cells[rowIndex]}
                      onChange={(newText) => {
                        onChange(
                          changeCell(value, { colIndex, rowIndex, newText })
                        );
                      }}
                      validate={(text) => validateCell(column.cellType, text)}
                    />
                  </TdElement>
                );
              })}
            </BodyTrElement>
          );
        })}
      </tbody>
    </TableElement>
  );
};
