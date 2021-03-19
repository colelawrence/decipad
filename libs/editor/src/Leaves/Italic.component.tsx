import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderLeafProps } from 'slate-react';

export const Italic = ({
  attributes,
  children,
}: RenderLeafProps): JSX.Element => {
  return (
    <Text as="span" fontStyle="italic" {...attributes}>
      {children}
    </Text>
  );
};
