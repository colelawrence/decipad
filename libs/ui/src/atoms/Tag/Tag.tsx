import { css } from '@emotion/react';
import { cssVar, p8Medium } from '../../primitives';
import { Tooltip } from '../Tooltip/Tooltip';

// If we get further types of labels,
// consider pulling up the bubble styles into some Bubble Label molecule
// and making this just about the label text and id behavior.

const tagStyles = css(p8Medium, {
  position: 'relative',
  padding: '4px 8px',
  borderRadius: '4px',
  backgroundColor: cssVar('liveDataBackgroundColor'),
  color: cssVar('normalTextColor'),
});

interface TagProps {
  readonly children: React.ReactNode;
  readonly explanation?: React.ReactNode;
}
export const Tag: React.FC<TagProps> = ({ children, explanation }) => {
  const tooltipTrigger = (
    <span contentEditable={false} css={tagStyles}>
      {children}
    </span>
  );
  return <Tooltip trigger={tooltipTrigger}>{explanation}</Tooltip>;
};
