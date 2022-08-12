import { FC, ReactNode } from 'react';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';

interface TableRowProps {
  readonly attributes?: PlateComponentAttributes;
  readonly children?: ReactNode;
  readonly isFullWidth: boolean;
}

const dataViewRowStyles = css({
  '& > *:first-child': {
    fontWeight: '700',
  },
});

export const DataViewRow = ({
  attributes,
  children,
  isFullWidth,
}: TableRowProps): ReturnType<FC> => {
  return (
    <tr {...attributes} css={[isFullWidth ? dataViewRowStyles : null]}>
      {children}
    </tr>
  );
};
