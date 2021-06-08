import { Button } from '@chakra-ui/react';
import React from 'react';
import { Editor, Text, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { IToolbarOptions } from './options';

export const FormatButton = ({ type, Span }: IToolbarOptions): JSX.Element => {
  const editor = useSlate();

  const isFormatActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => n[format] === true,
      mode: 'all',
    });
    return !!match;
  };

  const toggleFormat = (editor: Editor, format: string) => {
    const active = isFormatActive(editor, format);
    Transforms.setNodes(
      editor,
      { [format]: active ? null : true },
      { match: Text.isText, split: true }
    );
  };

  return (
    <Button
      d="inline-block"
      variant="unstyled"
      size="md"
      color={isFormatActive(editor, type) ? '#fff' : 'gray.500'}
      _focus={{ outline: 'none' }}
      onMouseDown={() => toggleFormat(editor, type)}
    >
      <Span />
    </Button>
  );
};
