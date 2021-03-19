import { UnorderedList } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const BulletList = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return <UnorderedList {...attributes}>{children}</UnorderedList>;
};
