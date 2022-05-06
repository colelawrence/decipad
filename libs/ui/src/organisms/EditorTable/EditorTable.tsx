import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { Table } from '..';
import { AddTableRowButton } from '../../molecules';
import { TableColumn } from '../../types';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';

const wrapperStyles = css({
  margin: 'auto',
  marginBottom: '8px',
  paddingBottom: '6px',
});

const tableStyles = css({
  display: 'grid',
  overflowX: 'auto',
});

interface Column {
  width: number | undefined;
  name: string;
  cellType: TableColumn['cellType'];
}

interface EditorTableProps {
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;

  readonly columns: Column[];
  readonly children?: ReactNode;
  readonly dropRef?: ConnectDropTarget;
  readonly onAddRow?: () => void;
}

export const EditorTable: FC<EditorTableProps> = ({
  onAddRow,
  columns,
  children,
  dropRef,
  icon,
  color,
  onChangeIcon = noop,
  onChangeColor = noop,
}: EditorTableProps): ReturnType<FC> => {
  const [caption, thead, ...tbody] = Children.toArray(children);

  return (
    <TableStyleContext.Provider
      value={{
        icon,
        color,
        setIcon: onChangeIcon,
        setColor: onChangeColor,
      }}
    >
      <div css={wrapperStyles}>
        {caption}
        <div css={tableStyles}>
          <Table dropRef={dropRef}>
            <thead>{thead}</thead>
            <tbody>{tbody}</tbody>
            <tfoot contentEditable={false}>
              <AddTableRowButton
                colSpan={columns.length + 1}
                onAddRow={onAddRow}
              />
            </tfoot>
          </Table>
        </div>
      </div>
    </TableStyleContext.Provider>
  );
};
