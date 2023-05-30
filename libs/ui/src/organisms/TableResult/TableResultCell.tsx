/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useRef } from 'react';
import { css } from '@emotion/react';
import { SerializedType, SerializedTypes } from '@decipad/computer';
import { AnyElement } from '@decipad/editor-types';
import { CodeResult } from '..';
import { TableData } from '../../atoms';
import { DragHandle } from '../../icons/index';
import { cssVar } from '../../primitives';
import { table } from '../../styles';
import { tableParentStyles } from '../../styles/table';
import type { CodeResultProps } from '../../types';

interface TableResultCellProps {
  cellValue: any;
  colIndex: number;
  isLiveResult?: boolean;
  allowsForLookup?: boolean;
  onDragStartCell?: CodeResultProps<'materialized-table'>['onDragStartCell'];
  onDragEnd?: CodeResultProps<'materialized-table'>['onDragEnd'];
  tableType: SerializedTypes.MaterializedTable | SerializedTypes.Table;
  columnName: string;
  columnType: SerializedType;
  value: string;
  element?: AnyElement;
  tooltip?: boolean;
}

export const TableResultCell: FC<TableResultCellProps> = ({
  cellValue,
  colIndex,
  isLiveResult,
  allowsForLookup,
  onDragStartCell,
  onDragEnd,
  tableType,
  columnName,
  columnType,
  value,
  element,
  tooltip,
}) => {
  const previewRef = useRef<Element>(null);

  return (
    <TableData
      ref={previewRef}
      key={colIndex}
      as="td"
      isEditable={false}
      isLiveResult={isLiveResult}
      showPlaceholder={false}
      css={{ ...tableParentStyles }}
      draggable={!!onDragStartCell && allowsForLookup}
      firstChildren={
        <div
          draggable
          onDragStart={(e) => {
            onDragStartCell?.(
              {
                tableName: tableType.indexName ?? '',
                columnName,
                cellValue: value,
              },
              {
                previewRef,
                result: {
                  type: columnType,
                  value: cellValue,
                },
              }
            )(e);
          }}
          onDragEnd={onDragEnd}
          className={onDragStartCell && 'drag-handle'}
          css={{
            display: 'none',
            position: 'absolute',
            top: 8,
            right: 4,
            zIndex: 2,
            height: 18,
            width: 18,
            borderRadius: 6,
            ':hover': {
              background: cssVar('highlightColor'),
            },
          }}
        >
          <button
            css={{
              width: '8px',
              height: 9,
              transform: 'translateY(50%)',
              display: 'block',
              margin: 'auto',
              cursor: 'grab',
            }}
          >
            <DragHandle />
          </button>
        </div>
      }
      element={element}
    >
      <div
        css={[
          css(table.getCellWrapperStyles(columnType)),
          colIndex === 0 && table.cellLeftPaddingStyles,
        ]}
      >
        <CodeResult
          parentType={tableType}
          type={columnType}
          value={cellValue}
          variant="block"
          tooltip={tooltip}
          isLiveResult={isLiveResult}
          element={element}
        />
      </div>
    </TableData>
  );
};
