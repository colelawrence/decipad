import { useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { BlockquoteStyles } from './Blockquote.styles';

interface BlockquoteProps extends RenderElementProps {
  children: string;
}

export const Blockquote = ({
  attributes,
  children,
}: BlockquoteProps): JSX.Element => {
  const bg = useColorModeValue('green.50', 'green.800');
  return (
    <BlockquoteStyles as="blockquote" bg={bg} {...attributes}>
      {children}
    </BlockquoteStyles>
  );
};
