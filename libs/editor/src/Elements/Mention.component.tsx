import { Tag, TagLabel, Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const Mention = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  return (
    <Text as="span" {...attributes}>
      <Tag
        contentEditable={false}
        size="md"
        colorScheme="blue"
        borderRadius="full"
      >
        <TagLabel>@{element.user}</TagLabel>
      </Tag>
      {children}
    </Text>
  );
};
