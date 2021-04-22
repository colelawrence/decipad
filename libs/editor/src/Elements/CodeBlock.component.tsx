import { Box, Code, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const CodeBlock = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  const bg = useColorModeValue('gray.100', 'gray.700');
  return (
    <Box>
      {element.result && (
        <Box contentEditable={false} bg="green.500" color="#fff">
          {element.result}
        </Box>
      )}
      <Code
        w="100%"
        p="5"
        mb="3"
        mt="5"
        {...attributes}
        bg={bg}
        borderRadius="0"
      >
        {children}
      </Code>
    </Box>
  );
};
