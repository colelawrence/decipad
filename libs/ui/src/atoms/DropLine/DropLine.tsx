import { css } from '@emotion/react';
import { blue300 } from '../../primitives';
import { dropLineWidth } from '../../styles/drop-line';

const dropLineCommonStyles = css({
  backgroundColor: blue300.rgb,
  zIndex: 1,
});

const dropLineBlockStyles = css({
  height: `${dropLineWidth}px`,
  border: 'none',
  borderRadius: '4px',
  backgroundColor: blue300.rgb,
});

const dropLineTableStyles = css({
  borderRadius: 'unset',
});

const dropLineVerticalStyles = css({
  position: 'absolute',
  height: '100%',
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
