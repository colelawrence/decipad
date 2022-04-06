import { nanoid } from 'nanoid';
import { useState } from 'react';
import { css } from '@emotion/react';
import { codeBlock } from '../../styles';
import { blue50, blue300 } from '../../primitives';

// If we get further types of labels,
// consider pulling up the bubble styles into some Bubble Label molecule
// and making this just about the label text and id behavior.

const bubbleStyles = css(codeBlock.variableStyles, {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',

  padding: '4px 8px',
  borderRadius: '8px',

  backgroundColor: blue50.rgb,
  border: `solid 1px ${blue300.rgb}`,
});

interface LabelProps {
  readonly children: React.ReactNode;
  readonly renderContent: (id: string) => React.ReactNode;
}
export const Label: React.FC<LabelProps> = ({ children, renderContent }) => {
  const id = `label-${useState(nanoid)[0]}`;
  return (
    <div css={bubbleStyles}>
      <label htmlFor={id}>{children}</label>
      {renderContent(id)}
    </div>
  );
};
