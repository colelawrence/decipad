import { FC, ReactNode } from 'react';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

interface TableRowProps {
  readonly attributes?: PlateComponentAttributes;
  readonly children?: ReactNode;
  readonly isFullWidth: boolean;
  readonly isBeforeFullWidthRow: boolean;
  readonly global: boolean;
}

const dataViewRowStyles = css({
  borderBottom: `1px solid ${cssVar('strongHighlightColor')}`,

  '&:last-of-type': {
    borderBottomColor: cssVar('normalTextColor'),
  },
});

const dataViewRowGlobalStyles = css({
  color: cssVar('weakTextColor'),
  backgroundColor: cssVar('highlightColor'),
});

export const DataViewRow = ({
  attributes,
  children,
  global = false,
}: TableRowProps): ReturnType<FC> => {
  return (
    <tr
      {...attributes}
      css={[dataViewRowStyles, global && dataViewRowGlobalStyles]}
    >
      {children}
    </tr>
  );
};
