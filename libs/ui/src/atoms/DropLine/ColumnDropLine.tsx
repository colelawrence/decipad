import { css } from '@emotion/react';
import { DropLine } from './DropLine';

const dropStyles = css({
  position: 'absolute',
  top: 0,
  height: 'calc(100% + 1px)',
});

const leftDropStyles = css({
  left: -1,
});

const rightDropStyles = css({
  right: 0,
});

export const ColumnDropLine = ({
  dropDirection,
}: {
  dropDirection: 'left' | 'right';
}) => {
  return (
    <div
      css={[
        dropStyles,

        dropDirection === 'left' && leftDropStyles,
        dropDirection === 'right' && rightDropStyles,
      ]}
      contentEditable={false}
    >
      <DropLine variant="inline" />
    </div>
  );
};
