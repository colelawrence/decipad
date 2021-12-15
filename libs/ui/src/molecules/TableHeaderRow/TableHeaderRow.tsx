import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { cssVar, grey250 } from '../../primitives';
import { Create } from '../../icons';
import { noop } from '../../utils';
import { TableHeader } from '../../atoms';
import { EditableTableHeader } from '../../organisms';
import { table } from '../../styles';

const createColumnThStyles = css({
  backgroundColor: cssVar('highlightColor'),
  '&:hover, &:focus-within': {
    backgroundColor: cssVar('strongHighlightColor'),
  },

  boxShadow: `inset 0px -2px 0px ${grey250.rgb}`,

  // Each row is as tall as the tallest cell, so our rows are at least this high.
  minHeight: table.thMinHeight,
  width: table.buttonColumnWidth,

  padding: 0,
});

const buttonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
});

const iconWrapperStyles = css({
  height: '20px',
  width: '20px',
});

interface TableHeaderRowProps {
  readonly children: ReactNode;
  readonly onAddColumn?: () => void;
  readonly readOnly?: boolean;
}

export const TableHeaderRow = ({
  children,
  onAddColumn = noop,
  readOnly = false,
}: TableHeaderRowProps): ReturnType<FC> => {
  return (
    <tr
      css={{
        display: 'grid',
        gridTemplate: table.rowTemplate(
          Children.toArray(children).length,
          readOnly
        ),
      }}
    >
      {Children.map(children, (child) => {
        if (child == null) {
          return null;
        }
        if (
          isElement(child) &&
          (child.type === TableHeader || child.type === EditableTableHeader)
        ) {
          return child;
        }
        console.error(
          'Received child that is not a table header component',
          child
        );
        throw new Error('Expected all children to be table header components');
      })}
      {!readOnly && (
        <th css={createColumnThStyles}>
          <button css={buttonStyles} onClick={onAddColumn}>
            <span css={iconWrapperStyles}>
              <Create />
            </span>
          </button>
        </th>
      )}
    </tr>
  );
};
