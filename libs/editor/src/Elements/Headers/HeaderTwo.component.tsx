import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const HeaderTwo = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="h2" fontSize="3xl" fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
