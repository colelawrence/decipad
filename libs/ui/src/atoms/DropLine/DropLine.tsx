import { css } from '@emotion/react';
import { blue300 } from '../../primitives';

const dropLineCommonStyles = css({
  backgroundColor: blue300.rgb,
});

export const dropLineHeight = 2;

const dropLineBlockStyles = css({
  height: `${dropLineHeight}px`,
  border: 'none',
  borderRadius: '4px',
  backgroundColor: blue300.rgb,
});

const dropLineTableStyles = css({
  borderRadius: 'unset',
});

const dropLineVerticalStyles = css({
  position: 'absolute',
  height: '32px',
  width: '2px',
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
      <hr
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
