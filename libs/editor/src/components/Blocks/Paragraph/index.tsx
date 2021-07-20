import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';
import React from 'react';

const Element = styled('p')({
  lineHeight: '1.75',
  color: '#3E3E42',
  padding: '8px 0',
  position: 'relative',
  '& ::selection': {
    backgroundColor: 'rgba(196, 202, 251, 0.5)',
  },
});

export const Paragraph: SlatePluginComponent = ({ attributes, children }) => {
  return <Element {...attributes}>{children}</Element>;
};
