import { Box, Checkbox, Text } from '@chakra-ui/react';

import { Transforms } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlate,
} from 'slate-react';

export const TodoListItem = ({
  attributes,
  children,
  element,
}: RenderElementProps): JSX.Element => {
  const editor = useSlate();
  const readOnly = useReadOnly();
  const { checked } = element;

  return (
    <Box {...attributes} display="flex" flexDirection="row" p="3px 0">
      <Box
        contentEditable={false}
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="24px"
        height="24px"
        sx={{ '&:focus': { outline: 'none' } }}
        mr="6px"
      >
        <Checkbox
          defaultChecked={!!checked}
          userSelect="none"
          w="16px"
          h="16px"
          m="0"
          sx={{ '&:focus': { outline: 'none' } }}
          onChange={(e) => {
            const path = ReactEditor.findPath(editor as any, element);

            Transforms.setNodes(
              editor,
              { checked: e.target.checked },
              { at: path }
            );
          }}
        />
      </Box>
      <Text
        as="span"
        flex="1"
        opacity={checked ? 0.666 : 1}
        textDecoration={checked ? 'line-through' : 'none'}
        sx={{ '&:focus': { outline: 'none' } }}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </Text>
    </Box>
  );
};
