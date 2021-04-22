import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const HeaderSix = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="h6" fontSize="md" fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
