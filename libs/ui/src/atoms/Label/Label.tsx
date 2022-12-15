import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { codeBlock } from '../../styles';
import { cssVar } from '../../primitives';

// If we get further types of labels,
// consider pulling up the bubble styles into some Bubble Label molecule
// and making this just about the label text and id behavior.

const labelContainerStyles = css({
  display: 'flex',
  flexWrap: 'nowrap',
  gap: '4px',
});

const hoveredBubbleStyles = css({
  backgroundColor: cssVar('strongHighlightColor'),
});

const bubbleStyles = css(codeBlock.variableStyles, {
  padding: '4px 8px',
  borderRadius: '8px',

  backgroundColor: cssVar('highlightColor'),
  border: `solid 1px ${cssVar('strongerHighlightColor')}`,
  ':hover': {
    ...hoveredBubbleStyles,
  },
});

const baseLabelStyles = css({
  whiteSpace: 'nowrap',
  lineHeight: 'calc(1.5em + 1px)',
});

interface LabelProps {
  readonly children: React.ReactNode;
  readonly onHover?: (hover: boolean) => void;
  readonly renderContent: (id: string) => React.ReactNode;
}
export const Label: React.FC<LabelProps> = ({
  children,
  onHover = noop,
  renderContent,
}) => {
  const id = `label-${useState(nanoid)[0]}`;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    onHover(hovered);
  }, [hovered, onHover]);

  return (
    <div
      css={labelContainerStyles}
      onMouseEnter={useCallback(() => setHovered(true), [])}
      onMouseLeave={useCallback(() => setHovered(false), [])}
    >
      <label css={baseLabelStyles} htmlFor={id}>
        {children}
      </label>
      <div css={[bubbleStyles, hovered && hoveredBubbleStyles]}>
        {renderContent(id)}
      </div>
    </div>
  );
};
