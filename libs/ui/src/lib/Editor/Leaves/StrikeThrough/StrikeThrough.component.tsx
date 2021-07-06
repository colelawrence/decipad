import { Text } from '@chakra-ui/react';

import { RenderLeafProps } from 'slate-react';

export const StrikeThrough = ({
  attributes,
  children,
}: RenderLeafProps): JSX.Element => {
  return (
    <Text as="span" textDecoration="line-through" {...attributes}>
      {children}
    </Text>
  );
};
