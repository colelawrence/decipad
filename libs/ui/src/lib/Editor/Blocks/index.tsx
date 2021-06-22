import { Box, Divider } from '@chakra-ui/react';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { Blockquote } from './Blockquote/Blockquote.component';
import { BulletList } from './BulletList/BulletList.component';
import { Code } from './Code/Code.component';
import { CodeBlock } from './CodeBlock/CodeBlock.component';
import { Header } from './Header/Header.component';
import { ListItem } from './ListItem/ListItem.component';
import { Mention } from './Mention/Mention.component';
import { NumberedList } from './NumberedList/NumberedList.component';
import { Paragraph } from './Paragraph/Paragraph.component';
import { TodoListItem } from './TodoListItem.component';

export const Blocks = (props: RenderElementProps): JSX.Element => {
  switch (props.element.type) {
    case 'h1':
      return <Header size="h1" {...props} />;
    case 'h2':
      return <Header size="h2" {...props} />;
    case 'h3':
      return <Header size="h3" {...props} />;
    case 'h4':
      return <Header size="h4" {...props} />;
    case 'h5':
      return <Header size="h5" {...props} />;
    case 'h6':
      return <Header size="h6" {...props} />;
    case 'blockquote':
      return <Blockquote {...props} />;
    case 'p':
      return <Paragraph {...props} />;
    case 'code':
      return <Code {...props} />;
    case 'code_block':
      return <CodeBlock {...props} />;
    case 'ul':
      return <BulletList {...props} />;
    case 'ol':
      return <NumberedList {...props} />;
    case 'li':
      return <ListItem {...props} />;
    case 'action_item':
      return <TodoListItem {...props} />;
    case 'divider':
      return (
        <Box {...props.attributes}>
          <Divider my="5" contentEditable={false} />
          {props.children}
        </Box>
      );
    case 'mention':
      return <Mention {...props} />;
    default:
      return <Box {...props} />;
  }
};
