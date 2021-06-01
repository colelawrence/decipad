import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const Paragraph = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="p" {...attributes}>
      {children}
    </Text>
  );
};
