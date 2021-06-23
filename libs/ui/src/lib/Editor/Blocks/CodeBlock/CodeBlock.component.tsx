import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

import { useResult } from '../../../Contexts/Results'
import { Result } from '../Result/Result.component';
import { CodeBlockStyles } from './CodeBlock.styles';

export const CodeBlock = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  const bg = useColorModeValue('gray.100', 'gray.700');
  const result = useResult((element as any).id ?? '')

  return (
    <Box>
      <CodeBlockStyles bg={bg} {...attributes}>
        {children}
      </CodeBlockStyles>
      {result && <Result {...result} />}
    </Box>
  );
};
