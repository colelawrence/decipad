/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import {
  dropLineThickness,
  dropLineCommonStyles,
} from '../../../styles/drop-line';

const tableDropLineRowStyles = css({
  height: `${dropLineThickness}px`,
  border: 'none',
});

const tableDropLineColumnStyles = css({
  position: 'absolute',
  height: '100%',
  left: '0',
  top: '0',
  width: `${dropLineThickness}px`,
});

export type TableDropLineProps = { variant: 'row' | 'column' };

export const TableDropLine = ({
  variant,
}: TableDropLineProps): ReturnType<React.FC> => {
  if (variant === 'row') {
    return (
      <div
        contentEditable={false}
        role="presentation"
        aria-label="Drop Line"
        css={[dropLineCommonStyles, tableDropLineRowStyles]}
      />
    );
  }

  return (
    <span
      contentEditable={false}
      role="presentation"
      aria-label="Drop"
      css={[dropLineCommonStyles, tableDropLineColumnStyles]}
    >
      &nbsp;
    </span>
  );
};
