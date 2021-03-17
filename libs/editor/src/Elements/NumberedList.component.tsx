import { OrderedList } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';

export const NumberedList = ({
  attributes,
  children,
}: RenderElementProps): JSX.Element => {
  return <OrderedList {...attributes}>{children}</OrderedList>;
};
