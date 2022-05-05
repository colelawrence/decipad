import { css } from '@emotion/react';
import { blue300 } from '../../primitives';

const dropLineCommonStyles = css({
  backgroundColor: blue300.rgb,
});

const dropLineBlockStyles = css({
  height: '2px',
  borderRadius: '4px',
  backgroundColor: blue300.rgb,
});

const dropLineVerticalStyles = css({
  position: 'absolute',
  height: '32px',
  width: '2px',
});

export type DropLineProps =
  | undefined
  | {
      variant?: 'block' | 'inline';
    };

export const DropLine = ({
  variant = 'block',
}: DropLineProps = {}): ReturnType<React.FC> => {
  if (variant === 'block') {
    return (
      <hr
        contentEditable={false}
        role="presentation"
        aria-label="Drop Line"
        css={[dropLineCommonStyles, dropLineBlockStyles]}
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
