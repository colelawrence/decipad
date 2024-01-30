/* eslint decipad/css-prop-named-variable: 0 */
import { css, SerializedStyles } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Medium } from '../../../primitives';

interface FilterBubblesProps {
  icon: ReactNode;
  description: string;
  iconStyles?: SerializedStyles;
  testid?: string;
}

export const FilterBubbles = ({
  icon,
  iconStyles,
  description,
  testid,
}: FilterBubblesProps): ReturnType<FC> => {
  return (
    <span css={tagStyle} data-testid={testid}>
      <span css={[tagInlineStyles, iconStyles]}>{icon}</span>
      <span css={[tagInlineStyles, tagInlineTextAdjustmentForFont]}>
        {description}
      </span>
    </span>
  );
};

const tagStyle = css(p12Medium, {
  boxShadow: `inset 0px 0px 0px 1px ${cssVar('borderSubdued')}`,
  padding: '3px 8px 3px 6px',
  borderRadius: '4px',
  display: 'flex',
  gap: '4px',
  maxWidth: 125,
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
});

const tagInlineStyles = css({
  minHeight: '12px',
  minWidth: '12px',
});

const tagInlineTextAdjustmentForFont = css({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
});
