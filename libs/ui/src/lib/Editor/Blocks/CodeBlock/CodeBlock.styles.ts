import { Box, Code } from '@chakra-ui/layout';
import { chakra } from '@chakra-ui/system';

export const ResultStyles = chakra(Box, {
  baseStyle: {
    bg: 'green.100',
    color: 'green.500',
    py: 2,
    px: 6,
    d: 'inline-block',
    borderTopRadius: 6,
    fontWeight: 'bold',
  },
});

export const CodeBlockStyles = chakra(Code, {
  baseStyle: {
    w: '100%',
    p: 5,
    mb: 3,
  },
});
