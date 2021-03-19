import {
  Box,
  Grid,
  Square,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { getPreventDefaultHandler } from '@udecode/slate-plugins';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { Editor, Location, Range } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import { Command } from './commands';

const Portal = dynamic(
  () => import('../utils/Portal.component').then((res) => res.Portal),
  {
    ssr: false,
  }
);

export interface DashCommandsPortalProps {
  target: Range | null;
  values: Command[];
  index: number;
  onClick: (
    editor: Editor,
    type: string,
    target: Location,
    mode: 'block' | 'inline' | 'inline-block'
  ) => void;
}

export const DashCommandsPortal = ({
  target,
  values,
  index,
  onClick,
}: DashCommandsPortalProps): JSX.Element | null => {
  const ref = useRef<HTMLDivElement>(null);
  const portalBG = useColorModeValue('white', 'gray.700');
  const indexBG = useColorModeValue('gray.100', 'gray.600');
  const { colorMode } = useColorMode();
  const editor = useEditor();

  useEffect(() => {
    if (target !== null && values.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [editor, target, values.length, index]);

  if (target && values.length > 0) {
    return (
      <Portal>
        <Box
          ref={ref}
          bg={portalBG}
          pos="absolute"
          boxShadow="0 1px 5px rgba(0, 0, 0, 0.2)"
          borderRadius="5px"
          overflow="hidden"
          width="250px"
        >
          {values.map((value: Command, i) => (
            <Grid
              key={`${value.type}${i}`}
              bg={i === index ? indexBG : 'transparent'}
              p="15px"
              gridTemplateColumns="0.4fr 1fr"
              gridGap="15px"
              onMouseDown={getPreventDefaultHandler(
                onClick,
                editor,
                value.type,
                target,
                value.mode
              )}
            >
              <Square>
                {colorMode === 'dark' ? (
                  <Image
                    src={value.darkImage}
                    alt="Preview"
                    height="20px"
                    width="auto"
                  />
                ) : (
                  <Image
                    src={value.lightImage}
                    alt="Preview"
                    height="20px"
                    width="auto"
                  />
                )}
              </Square>
              <Box>
                <Text as="h2" fontSize="md">
                  {value.title}
                </Text>
                <Text opacity={0.6} fontSize="sm">
                  {value.description}
                </Text>
              </Box>
            </Grid>
          ))}
        </Box>
      </Portal>
    );
  }

  return null;
};
