import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins-core';
import React from 'react';

const Element = styled('h2')({
  fontSize: '24px',
  margin: 0,
  padding: '2rem 0 1rem 0',
  fontWeight: 'bold',
  color: '#121214',
});

export const Subtitle: SlatePluginComponent = ({ attributes, children }) => {
  return <Element {...attributes}>{children}</Element>;
};
