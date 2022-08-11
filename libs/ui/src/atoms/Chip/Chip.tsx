import { css } from '@emotion/react';
import { p8Medium, red100, red700 } from '../../primitives';

const chipWrapperStyles = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: red100.rgb,
  borderRadius: 8,
  padding: '4px 8px',
});

const chipTextStyles = css(p8Medium, {
  color: red700.rgb,
  fontSize: 13,
});

interface ChipProps {
  readonly text: string;
}

export const Chip: React.FC<ChipProps> = ({ text }) => {
  return (
    <div css={chipWrapperStyles}>
      <p css={chipTextStyles}>
        {text.length < 30 ? text : `${text.slice(0, 30)}...`}
      </p>
    </div>
  );
};
