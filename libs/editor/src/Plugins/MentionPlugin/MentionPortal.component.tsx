import { Box, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { Portal } from 'react-portal';
import { Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';

export interface MentionPortalProps {
  target: Range | null | undefined;
  users: string[];
  index: number;
}

export const MentionPortal = ({
  target,
  users,
  index,
}: MentionPortalProps): JSX.Element | null => {
  const ref = useRef<HTMLDivElement>(null);
  const bg = useColorModeValue('white', 'gray.700');
  const userBG = useColorModeValue('gray.100', 'gray.600');
  const editor = useSlate();

  useEffect(() => {
    if (target && users.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor as any, target);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [editor, target, users.length]);

  if (target && users.length > 0) {
    return (
      <Portal>
        <Box
          ref={ref}
          pos="absolute"
          left="-9999px"
          top="-9999px"
          zIndex="999"
          bg={bg}
          borderRadius="5px"
          overflow="hidden"
          boxShadow="0 1px 5px rgba(0,0,0,.2)"
        >
          {users.map((user, i) => (
            <Box
              key={user}
              p="15px 20px"
              borderRadius="3px"
              bg={i === index ? userBG : 'transparent'}
            >
              {user}
            </Box>
          ))}
        </Box>
      </Portal>
    );
  }

  return null;
};
