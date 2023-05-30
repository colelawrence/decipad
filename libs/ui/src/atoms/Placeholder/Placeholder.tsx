/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { cssVar } from '../../primitives';

const styles = css({
  display: 'flex',
  minHeight: '8px',

  backgroundColor: cssVar('highlightColor'),
  borderRadius: '4px',
});
const lessRoundStyles = css({
  borderRadius: '2px',
});

interface PlaceholderProps {
  lessRound?: boolean;
}

export const Placeholder = ({
  lessRound = false,
}: PlaceholderProps): ReturnType<React.FC> => {
  return (
    <div role="presentation" css={[styles, lessRound && lessRoundStyles]} />
  );
};
