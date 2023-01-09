import { SerializedType } from '@decipad/language';
import { css } from '@emotion/react';
import { ReactElement, useState } from 'react';
import { MenuItem } from '../../atoms';
import { Add } from '../../icons';
import { cssVar } from '../../primitives';
import { MenuList } from '../MenuList/MenuList';

// Data

export type Column = {
  name: string;
  blockId?: string;
  type: SerializedType;
};

export interface DataViewMenuProps {
  availableColumns: Column[] | undefined;
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
        <button
          aria-roledescription="Add column"
          onClick={() => handleMenuClick()}
          css={menuButtonStyles}
        >
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
            availableColumns.map((availableColumn, index) => {
              return (
                <MenuItem
                  key={index}
                  onSelect={() =>
                    onInsertColumn(
                      availableColumn.blockId ?? availableColumn.name,
                      availableColumn.type
                    )
                  }
                >
                  {availableColumn.name}
                </MenuItem>
              );
            })}
        </MenuList>
      </div>
    </div>
  );
};
