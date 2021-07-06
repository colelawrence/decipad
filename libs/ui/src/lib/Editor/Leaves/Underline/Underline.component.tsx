import { Text } from '@chakra-ui/react';

import { RenderLeafProps } from 'slate-react';

export const Underline = ({
  attributes,
  children,
}: RenderLeafProps): JSX.Element => {
  return (
    <Text as="span" textDecoration="underline" {...attributes}>
      {children}
    </Text>
  );
};
