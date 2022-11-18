import { css } from '@emotion/react';
import { cssVar } from '../../primitives';
import { dropLineWidth } from '../../styles/drop-line';

const dropLineCommonStyles = css({
  backgroundColor: cssVar('droplineColor'),
  zIndex: 2,
});

const dropLineBlockStyles = css({
  height: `${dropLineWidth}px`,
  border: 'none',
  borderRadius: '4px',
  backgroundColor: cssVar('droplineColor'),
});

const dropLineTableStyles = css({
  borderRadius: 'unset',
});

const dropLineVerticalStyles = css({
  height: '100%',
  left: '0',
  top: '0',
  width: `${dropLineWidth}px`,
});

export type DropLineProps =
  | undefined
  | {
      variant?: 'block' | 'table' | 'inline';
    };

export const DropLine = ({
  variant = 'block',
}: DropLineProps = {}): ReturnType<React.FC> => {
  if (['block', 'table'].includes(variant)) {
    return (
      <div
        contentEditable={false}
        role="presentation"
        aria-label="Drop Line"
        css={[
          dropLineCommonStyles,
          dropLineBlockStyles,
          variant === 'table' && dropLineTableStyles,
        ]}
      />
    );
  }
  return (
    <span
      contentEditable={false}
      role="presentation"
      aria-label="Drop"
      css={[dropLineCommonStyles, dropLineVerticalStyles]}
    >
      &nbsp;
    </span>
  );
};
