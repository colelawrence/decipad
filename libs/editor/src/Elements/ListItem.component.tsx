import { ListItem as ChakraListItem } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const ListItem = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return (
    <ChakraListItem {...attributes} ml="20px">
      {children}
    </ChakraListItem>
  );
};
