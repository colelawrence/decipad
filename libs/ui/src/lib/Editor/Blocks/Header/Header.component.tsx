import { Text } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

interface HeaderProps extends RenderElementProps {
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Header = ({
  attributes,
  children,
  size = 'h1',
}: HeaderProps): JSX.Element => {
  switch (size) {
    case 'h2':
      return (
        <Text as="h2" fontSize="3xl" fontWeight="bold" {...attributes}>
          {children}
        </Text>
      );
    case 'h3':
      return (
        <Text as="h2" fontSize="2xl" fontWeight="bold" {...attributes}>
          {children}
        </Text>
      );
    case 'h4':
      return (
        <Text as="h2" fontSize="xl" fontWeight="bold" {...attributes}>
          {children}
        </Text>
      );
    case 'h5':
      return (
        <Text as="h2" fontSize="lg" fontWeight="bold" {...attributes}>
          {children}
        </Text>
      );
    case 'h6':
      return (
        <Text as="h2" fontSize="md" fontWeight="bold" {...attributes}>
          {children}
        </Text>
      );
    default:
      return (
        <Text as="h1" fontSize="4xl" fontWeight="bold" {...attributes}>
          {children}
        </Text>
      );
  }
};
