import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins-core';
import React from 'react';

const Element = styled('h3')({
  fontSize: '20px',
  margin: 0,
  padding: '1rem 0 0.5rem 0',
  fontWeight: 'bold',
  color: '#121214',
});

export const Subheading: SlatePluginComponent = ({ attributes, children }) => {
  return <Element {...attributes}>{children}</Element>;
};
