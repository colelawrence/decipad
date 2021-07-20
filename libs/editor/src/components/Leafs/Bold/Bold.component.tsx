import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';
import React from 'react';

const Leaf = styled('span')({
  fontWeight: 'bold',
});

export const Bold: SlatePluginComponent = ({ attributes, children }) => {
  return <Leaf {...attributes}>{children}</Leaf>;
};
