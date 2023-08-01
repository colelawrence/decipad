/* eslint decipad/css-prop-named-variable: 0 */
import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';

interface TableRowProps {
  readonly attributes?: PlateComponentAttributes;
  readonly children?: ReactNode;
  readonly isFullWidth: boolean;
  readonly isBeforeFullWidthRow: boolean;
  readonly global: boolean;
  readonly rotate: boolean;
}

const dataViewRowStyles = css({
  borderBottom: `1px solid ${cssVar('borderSubdued')}`,

  '&:last-of-type': {
    borderBottomColor: cssVar('textDefault'),
  },
});

const dataViewRowGlobalStyles = css({
  color: cssVar('textSubdued'),
  backgroundColor: cssVar('backgroundDefault'),
});

export const DataViewRow = ({
  attributes,
  children,
  global = false,
  rotate,
}: TableRowProps): ReturnType<FC> => {
  return (
    <tr
      {...attributes}
      css={[dataViewRowStyles, !rotate && global && dataViewRowGlobalStyles]}
    >
      {children}
    </tr>
  );
};
