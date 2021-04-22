import { Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const Blockquote = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  const bg = useColorModeValue('blue.50', 'blue.800');
  return (
    <Text
      as="blockquote"
      pos="relative"
      p="20px 30px"
      display="block"
      fontWeight="bold"
      color="blue.300"
      bg={bg}
      _before={{
        content: `" "`,
        pos: 'absolute',
        left: 0,
        bottom: 0,
        w: '5px',
        h: '100%',
        bg: 'blue.300',
        borderRadius: 'full',
      }}
      mb="3"
      mt="3"
      {...attributes}
    >
      {children}
    </Text>
  );
};
