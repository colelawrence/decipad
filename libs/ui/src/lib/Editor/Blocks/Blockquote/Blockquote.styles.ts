import { Text } from '@chakra-ui/layout';
import { chakra } from '@chakra-ui/system';

export const BlockquoteStyles = chakra(Text, {
  baseStyle: {
    pos: 'relative',
    p: '20px 30px',
    display: 'block',
    fontWeight: 'bold',
    color: 'green.300',
    _before: {
      content: `" "`,
      pos: 'absolute',
      left: 0,
      bottom: 0,
      w: '5px',
      h: '100%',
      bg: 'green.300',
      borderRadius: 'full',
    },
    my: 3,
  },
});
