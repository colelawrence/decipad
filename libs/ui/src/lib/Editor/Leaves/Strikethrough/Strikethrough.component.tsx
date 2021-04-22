import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderLeafProps } from 'slate-react';

export const Strikethrough = ({
  attributes,
  children,
}: RenderLeafProps): JSX.Element => {
  return (
    <Text as="span" textDecoration="line-through" {...attributes}>
      {children}
    </Text>
  );
};
