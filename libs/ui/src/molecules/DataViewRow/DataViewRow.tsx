import { FC, ReactNode } from 'react';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

interface TableRowProps {
  readonly attributes?: PlateComponentAttributes;
  readonly children?: ReactNode;
  readonly isFullWidth: boolean;
  readonly isBeforeFullWidthRow: boolean;
}

const dataViewRowStyles = css({
  borderBottom: `1px solid ${cssVar('strongHighlightColor')}`,

  '&:last-of-type': {
    borderBottomColor: cssVar('normalTextColor'),
  },
});

const dataViewRowFullWidthStyles = css({
  '& > *:first-of-type': {
    fontWeight: '700',
  },

  borderTop: `1px solid ${cssVar('normalTextColor')}`,
});

const dataViewBeforeFullWidthRowStyles = css({
  border: 'none',
});

export const DataViewRow = ({
  attributes,
  children,
  isFullWidth,
  isBeforeFullWidthRow,
}: TableRowProps): ReturnType<FC> => {
  return (
    <tr
      {...attributes}
      css={[
        dataViewRowStyles,
        isBeforeFullWidthRow ? dataViewBeforeFullWidthRowStyles : null,
        isFullWidth ? dataViewRowFullWidthStyles : null,
      ]}
    >
      {children}
    </tr>
  );
};
