/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { cssVar } from '../../../primitives';

const styles = css({
  display: 'flex',
  minHeight: '8px',

  borderRadius: '4px',
});
const lessRoundStyles = css({
  borderRadius: '2px',
});

interface PlaceholderProps {
  lessRound?: boolean;
  bgColour?: 'default' | 'heavy';
}

const backgroundColors = {
  default: {
    backgroundColor: cssVar('backgroundDefault'),
  },
  heavy: {
    backgroundColor: cssVar('backgroundHeavy'),
  },
};

export const Placeholder = ({
  lessRound = false,
  bgColour = 'default',
}: PlaceholderProps): ReturnType<React.FC> => {
  return (
    <div
      role="presentation"
      css={[backgroundColors[bgColour], styles, lessRound && lessRoundStyles]}
    />
  );
};
