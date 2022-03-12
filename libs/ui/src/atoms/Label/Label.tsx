import { nanoid } from 'nanoid';
import { useState } from 'react';
import { css } from '@emotion/react';

const containerStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '8px',
});

interface LabelProps {
  readonly children: React.ReactNode;
  readonly renderContent: (id: string) => React.ReactNode;
}
export const Label: React.FC<LabelProps> = ({ children, renderContent }) => {
  const id = `label-${useState(nanoid)[0]}`;
  return (
    <div css={containerStyles}>
      <label htmlFor={id} css={{ display: 'flex' }}>
        {children}
      </label>
      {renderContent(id)}
    </div>
  );
};
