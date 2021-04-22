import { Code as ChakraCode } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const InlineCode = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return <ChakraCode {...attributes}>{children}</ChakraCode>;
};
