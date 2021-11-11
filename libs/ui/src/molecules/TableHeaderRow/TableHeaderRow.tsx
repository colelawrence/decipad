import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { cssVar, grey250 } from '../../primitives';
import { Create } from '../../icons';
import { noop } from '../../utils';
import { TableHeader } from '../../atoms';
import { EditableTableHeader } from '../../organisms';

const thStyles = css({
  backgroundColor: cssVar('highlightColor'),
  '&:hover, &:focus-within': {
    backgroundColor: cssVar('strongHighlightColor'),
  },

  boxShadow: `inset 0px -2px 0px ${grey250.rgb}`,

  // Each row is as tall as the tallest cell, so our rows are at least this high.
  height: '32px',
  width: '44px',

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
}

export const TableHeaderRow = ({
  children,
  onAddColumn = noop,
}: TableHeaderRowProps): ReturnType<FC> => {
  return (
    <tr>
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
      <th css={thStyles}>
        <button css={buttonStyles} onClick={onAddColumn}>
          <span css={iconWrapperStyles}>
            <Create />
          </span>
        </button>
      </th>
    </tr>
  );
};
