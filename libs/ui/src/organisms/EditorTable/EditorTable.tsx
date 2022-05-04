import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { Table } from '..';
import { AddTableRowButton } from '../../molecules';
import { TableColumn } from '../../types';
import { AvailableSwatchColor, UserIconKey } from '../../utils';

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
  readonly onAddRow?: () => void;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;
  readonly icon?: UserIconKey;
  readonly color?: AvailableSwatchColor;
  readonly columns: Column[];
  readonly children?: ReactNode;
}

export const EditorTable: FC<EditorTableProps> = ({
  onAddRow,
  columns,
  children,
}: EditorTableProps): ReturnType<FC> => {
  const [caption, thead, ...tbody] = Children.toArray(children);

  return (
    <div css={wrapperStyles}>
      {caption}
      <div css={tableStyles}>
        <Table>
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
  );
};
