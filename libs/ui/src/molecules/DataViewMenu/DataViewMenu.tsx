/* eslint decipad/css-prop-named-variable: 0 */
import { SerializedType } from '@decipad/language';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactElement, useState } from 'react';
import { MenuItem } from '../../atoms';
import { Add } from '../../icons';
import { cssVar } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { getTypeIcon } from '../../utils/table';
import { MenuList } from '../MenuList/MenuList';

// Data

export type Column = {
  name: string;
  blockId?: string;
  type: SerializedType;
};

export interface DataViewMenuProps {
  availableColumns: Column[] | undefined;
  onInsertColumn: (
    name: string,
    label: string,
    serializedType: SerializedType
  ) => void;
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

const iconTypeStyles = css({
  display: 'inline-block',
  marginRight: '10px',
  verticalAlign: 'middle',
  svg: {
    width: '16px',
    height: '16px',
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
  const readOnly = useIsEditorReadOnly();

  return (
    <div>
      {!readOnly &&
        (menuIsOpen ? null : (
          <button
            data-testid="add-data-view-column-button"
            aria-roledescription="Add column"
            onClick={() => handleMenuClick()}
            css={[menuButtonStyles, hideOnPrint]}
          >
            <Add />
          </button>
        ))}
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
              const Icon = getTypeIcon(availableColumn.type);

              return (
                <MenuItem
                  testid={`data-view-menu-item-${availableColumn.name}`}
                  key={index}
                  onSelect={() => {
                    return onInsertColumn(
                      availableColumn.blockId ?? availableColumn.name,
                      availableColumn.name,
                      availableColumn.type
                    );
                  }}
                >
                  {availableColumn.type.kind !== 'anything' && (
                    <div css={iconTypeStyles}>
                      {' '}
                      <Icon />
                    </div>
                  )}
                  {availableColumn.name}
                </MenuItem>
              );
            })}
        </MenuList>
      </div>
    </div>
  );
};
