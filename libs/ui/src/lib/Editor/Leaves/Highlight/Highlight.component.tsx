import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderLeafProps } from 'slate-react';

export const Highlight = ({
  attributes,
  children,
}: RenderLeafProps): JSX.Element => {
  return (
    <Text as="span" bg="purple.100" p="1" {...attributes}>
      {children}
    </Text>
  );
};
