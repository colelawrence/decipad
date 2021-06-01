import { Text } from '@chakra-ui/layout';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export interface HeaderProps extends RenderElementProps {
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Header = ({ attributes, children, size }: HeaderProps) => {
  const genFontSize = () => {
    switch (size) {
      case 'h1':
        return '4xl';

      case 'h2':
        return '3xl';

      case 'h3':
        return '2xl';

      case 'h4':
        return 'xl';

      case 'h5':
        return 'lg';

      default:
        return 'md';
    }
  };

  return (
    <Text as="h1" fontSize={genFontSize()} fontWeight="bold" {...attributes}>
      {children}
    </Text>
  );
};
