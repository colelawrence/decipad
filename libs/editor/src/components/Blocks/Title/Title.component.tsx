import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins-core';
import React from 'react';

const Element = styled('h1')({
  fontSize: '2rem',
  margin: 0,
  paddingBottom: '2rem',
  marginBottom: '16px',
  borderBottom: '1px solid #f0f0f2',
  fontWeight: 'bold',
  color: '#121214',
  '& ::selection': {
    backgroundColor: 'rgba(196, 202, 251, 0.5)',
  },
});

export const Title: SlatePluginComponent = ({ attributes, children }) => {
  return <Element {...attributes}>{children}</Element>;
};
