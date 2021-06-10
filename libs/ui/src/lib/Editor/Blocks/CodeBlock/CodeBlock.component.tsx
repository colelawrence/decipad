import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { CodeBlockStyles, ResultStyles } from './CodeBlock.styles';

export const CodeBlock = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  const bg = useColorModeValue('gray.100', 'gray.700');
  return (
    <Box>
      {element.result && (
        <ResultStyles contentEditable={false}>
          {element.result as string}
        </ResultStyles>
      )}
      <CodeBlockStyles bg={bg} {...attributes}>
        {children}
      </CodeBlockStyles>
    </Box>
  );
};
