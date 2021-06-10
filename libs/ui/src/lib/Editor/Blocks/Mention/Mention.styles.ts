import { Tag } from '@chakra-ui/react';
import { chakra } from '@chakra-ui/system';

export const TagStyles = chakra(Tag, {
  baseStyle: {
    size: 'md',
    colorScheme: 'blue',
    borderRadius: 'full',
  },
});
