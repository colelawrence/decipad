import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';
import React from 'react';

const Element = styled('div')({
  backgroundColor: '#BEE3F8',
  color: '#2B6CB0',
  lineHeight: '1.75',
  border: '1px solid #90CDF4',
  padding: '12px 24px',
  borderRadius: '8px',
  fontStyle: 'italic',
  fontSize: '16px',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
});

export const Blockquote: SlatePluginComponent = ({ attributes, children }) => {
  return <Element {...attributes}>{children}</Element>;
};
