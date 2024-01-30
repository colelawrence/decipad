/* eslint decipad/css-prop-named-variable: 0 */
import { SerializedStyles, css } from '@emotion/react';
import { DropLine } from './DropLine';

const dropStyles = css({
  position: 'absolute',
  top: 0,
  height: 'calc(100% + 1px)',
});

export const ColumnDropLine = ({
  dropDirection,
  rightStyles = css({ right: 0 }),
  leftStyles = css({ left: -1 }),
}: {
  dropDirection: 'left' | 'right';
  leftStyles?: SerializedStyles;
  rightStyles?: SerializedStyles;
}) => {
  return (
    <div
      css={[
        dropStyles,
        dropDirection === 'left' && leftStyles,
        dropDirection === 'right' && rightStyles,
      ]}
      contentEditable={false}
    >
      <DropLine variant="inline" />
    </div>
  );
};
