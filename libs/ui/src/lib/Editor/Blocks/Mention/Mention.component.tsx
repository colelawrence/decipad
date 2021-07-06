import { TagLabel, Text } from '@chakra-ui/react';

import { RenderElementProps } from 'slate-react';
import { TagStyles } from './Mention.styles';

export const Mention = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="span" {...attributes}>
      <TagStyles contentEditable={false}>
        <TagLabel>@{element.user}</TagLabel>
      </TagStyles>
      {children}
    </Text>
  );
};
