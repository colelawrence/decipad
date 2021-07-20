import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';
import React from 'react';

const Leaf = styled('span')({
  textDecoration: 'underline',
});

export const Underline: SlatePluginComponent = ({ attributes, children }) => {
  return <Leaf {...attributes}>{children}</Leaf>;
};
