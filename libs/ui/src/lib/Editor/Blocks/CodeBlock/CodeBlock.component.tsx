import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { Result } from '../../../Result/Result.component';
import { CodeBlockStyles } from './CodeBlock.styles';

export const CodeBlock = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  const bg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box>
      {element.result && <Result {...(element.result as any)} />}
      <CodeBlockStyles bg={bg} {...attributes}>
        {children}
      </CodeBlockStyles>
    </Box>
  );
};
