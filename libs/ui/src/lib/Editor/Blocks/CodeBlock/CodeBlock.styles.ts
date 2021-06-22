import { Code } from '@chakra-ui/layout';
import { chakra } from '@chakra-ui/system';

export const CodeBlockStyles = chakra(Code, {
  baseStyle: {
    w: '100%',
    p: 5,
    borderRadius: 2,
  },
});
