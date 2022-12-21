import { Interpreter, SerializedType } from '@decipad/language';
import { css } from '@emotion/react';
import { ReactElement, useState } from 'react';
import { MenuItem } from '../../atoms';
import { Add } from '../../icons';
import { cssVar } from '../../primitives';
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

const menuButtonStyles = css({
  backgroundColor: `${cssVar('highlightColor')}`,
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    width: '1rem',
    height: '1rem',
  },
});

export const DataViewMenu = ({
  availableColumns,
  onInsertColumn,
}: DataViewMenuProps): ReactElement<DataViewMenuProps> => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const handleMenuClick = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <div css={{}}>
      {menuIsOpen ? null : (
        <button onClick={() => handleMenuClick()} css={menuButtonStyles}>
          <Add />
        </button>
      )}
      <div css={dataViewMenuWrapperStyles}>
        <MenuList
          root
          trigger={<div />}
          open={menuIsOpen}
          onChangeOpen={setMenuIsOpen}
          dropdown
        >
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
