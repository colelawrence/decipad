import { Text } from '@chakra-ui/react';
import React from 'react';

export interface IToolbarOptions {
  type: string;
  Span: () => JSX.Element;
}

export const ToolbarOptions: IToolbarOptions[] = [
  {
    type: 'bold',
    Span: () => (
      <Text as="span" fontWeight="bold">
        B
      </Text>
    ),
  },
  {
    type: 'italic',
    Span: () => (
      <Text as="span" fontStyle="italic">
        I
      </Text>
    ),
  },
  {
    type: 'underline',
    Span: () => (
      <Text as="span" textDecor="underline">
        U
      </Text>
    ),
  },
  {
    type: 'strikethrough',
    Span: () => (
      <Text as="span" textDecor="line-through" fontStyle="italic">
        S
      </Text>
    ),
  },
  {
    type: 'code',
    Span: () => (
      <Text as="span" fontFamily="monospace">
        {'<'}/&gt;
      </Text>
    ),
  },
  {
    type: 'highlight',
    Span: () => (
      <Text as="span" bg="purple.100" color="#111" px="1">
        A
      </Text>
    ),
  },
];
