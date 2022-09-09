import { Interpreter, SerializedType } from '@decipad/language';
import { css } from '@emotion/react';
import { ReactElement } from 'react';
import { MenuItem } from '../../atoms';
import { MenuList } from '../MenuList/MenuList';

// Data

export type ColumnNames = string[];
export type ColumnTypes = SerializedType[];
export type Columns = [ColumnNames, ColumnTypes, Interpreter.ResultTable];

export interface DataViewMenuProps {
  availableColumns: Columns | undefined;
  onInsertColumn: (name: string, serializedType: SerializedType) => void;
}

const dataViewMenuWrapperStyles = css({
  margin: '8px',
});

export const DataViewMenu = ({
  availableColumns,
  onInsertColumn,
}: DataViewMenuProps): ReactElement<DataViewMenuProps> => {
  return (
    <div css={{}}>
      <div css={dataViewMenuWrapperStyles}>
        <MenuList root open portal={false}>
          {availableColumns &&
            availableColumns[0].map((availableColumnName, index) => {
              const matchingColumnIndex = availableColumns[0].findIndex(
                (columnName) => columnName === availableColumnName
              );

              if (matchingColumnIndex !== -1) {
                return (
                  <MenuItem
                    key={index}
                    onSelect={() =>
                      onInsertColumn(
                        availableColumnName,
                        availableColumns[1][matchingColumnIndex]
                      )
                    }
                  >
                    {availableColumnName}
                  </MenuItem>
                );
              }
              return null;
            })}
        </MenuList>
      </div>
    </div>
  );
};
