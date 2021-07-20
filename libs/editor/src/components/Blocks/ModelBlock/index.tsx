import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';
import React from 'react';

const Element = styled('div')({
  borderRadius: '16px',
  padding: '24px',
  backgroundColor: 'rgba(240, 240, 242, 0.2)',
  border: '1px solid #F0F0F2',
  lineHeight: '2.5',
  margin: '8px 0',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
  fontFamily: 'monospace',
  fontSize: '16px',
});

export const ModelBlock: SlatePluginComponent = ({ attributes, children }) => {
  return <Element {...attributes}>{children}</Element>;
};
