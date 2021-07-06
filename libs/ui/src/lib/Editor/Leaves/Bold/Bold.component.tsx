import { Text } from '@chakra-ui/react';

import { RenderLeafProps } from 'slate-react';

export const Bold = ({
  attributes,
  children,
}: RenderLeafProps): JSX.Element => {
  return (
    <Text as="span" fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
