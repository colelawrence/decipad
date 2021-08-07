import { Box } from '@chakra-ui/react';
import { CodeBlockElement, withProps } from '@udecode/slate-plugins';
import { RenderElementProps } from 'slate-react';
import { Result } from './Result.component';

const codeBlockStyles = {
  styles: {
    root: {
      borderRadius: '16px',
      padding: '24px',
      backgroundColor: 'rgba(240, 240, 242, 0.2)',
      border: '1px solid #F0F0F2',
      lineHeight: '2.5',
      margin: '8px 0',
      boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
      '& ::selection': {
        backgroundColor: 'rgba(196, 202, 251, 0.5)',
      },
    },
  },
};

const InnerCodeBlock = withProps(CodeBlockElement, codeBlockStyles);

export const CodeBlock = ({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { id: string } }): JSX.Element => {
  // const bg = useColorModeValue('gray.100', 'gray.700');
  const blockId = (element as any).id ?? '';

  return (
    <Box spellCheck={false}>
      <InnerCodeBlock
        attributes={attributes}
        element={{ ...element, type: 'code_block' }}
      >
        {children}
      </InnerCodeBlock>
      {blockId && <Result blockId={blockId} />}
    </Box>
  );
};
