import { Children, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Table } from '..';
import { AddTableRowButton } from '../../molecules';
import { TableColumn } from '../../types';
import { blockAlignment } from '../../styles';

const etStyle = css({
  maxWidth: blockAlignment.editorTable.desiredWidth,
  margin: 'auto',
  marginBottom: '8px',
  paddingBottom: '6px',
});

interface Column {
  width: number | undefined;
  name: string;
  cellType: TableColumn['cellType'];
}

interface EditorTableProps {
  readonly onAddRow?: () => void;
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
    <div css={etStyle}>
      {caption}
      <Table>
        <thead>{thead}</thead>
        <tbody>{tbody}</tbody>
        <tfoot contentEditable={false}>
          <AddTableRowButton colSpan={columns.length + 1} onAddRow={onAddRow} />
        </tfoot>
      </Table>
    </div>
  );
};
