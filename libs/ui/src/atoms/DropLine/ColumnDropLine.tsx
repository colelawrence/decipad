/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { DropLine } from './DropLine';

const dropStyles = css({
  position: 'absolute',
  top: 0,
  height: 'calc(100% + 1px)',
});

const leftDropStyles = (adjustLeftByPx: number) =>
  css({
    left: -1 + adjustLeftByPx,
  });

const rightDropStyles = (adjustRightByPx: number) =>
  css({
    right: 0 + adjustRightByPx,
  });

export const ColumnDropLine = ({
  dropDirection,
  adjustLeft = 0,
  adjustRight = 0,
}: {
  dropDirection: 'left' | 'right';
  adjustLeft?: number;
  adjustRight?: number;
}) => {
  return (
    <div
      css={[
        dropStyles,

        dropDirection === 'left' && leftDropStyles(adjustLeft),
        dropDirection === 'right' && rightDropStyles(adjustRight),
      ]}
      contentEditable={false}
    >
      <DropLine variant="inline" />
    </div>
  );
};
