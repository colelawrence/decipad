import styled from '@emotion/styled';
import React from 'react';
import { RenderLeafProps } from 'slate-react';

const Span = styled('span')({
  backgroundColor: '#DFFAE9',
  border: '1px solid #B3E5C6',
  padding: '6px 12px',
  margin: '6px 0',
  cursor: 'pointer',
  borderRadius: '50px',
});

export const Bubble = ({ attributes, children }: RenderLeafProps) => {
  return (
    <Span {...attributes} onClick={() => console.log('clicked')}>
      <span contentEditable={false}>$ </span>
      {children}
    </Span>
  );
};
