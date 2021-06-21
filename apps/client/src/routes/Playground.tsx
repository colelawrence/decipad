import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Icon,
  Image,
  Text,
} from '@chakra-ui/react';
import { AnonymousRuntimeProvider, DeciEditor } from '@decipad/editor';
import { nanoid } from 'nanoid';
import { FiArrowLeft, FiHelpCircle } from 'react-icons/fi';

export function Playground() {
  const randomId = useMemo(() => nanoid(), []);

  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  return (
    <AnonymousRuntimeProvider>
      <Box minH="100vh">
        <Button
          as="a"
          href="/"
          pos="absolute"
          top={12}
          left={12}
          aria-label="go back"
          leftIcon={<Icon as={FiArrowLeft} />}
        >
          Home
        </Button>
        <Container pt={12} maxW="75ch">
          <Image
            src="/assets/deci-logo-brand.png"
            alt="Brand"
            borderRadius="5px"
            mb={3}
            w={50}
            h={50}
          />
          <Heading>Deci Playground</Heading>
          <Text opacity={0.7} mt={3} mb={6}>
            This is a lightweight version of Deci, here you only get one pad.
            This version is intended just to test out how our pads work, play
            around and have fun!
          </Text>
          <Button
            as="a"
            href="https://www.notion.so/decipad/Deci-101-3f3b513b9a82499080eef6eef87d8179"
            target="_blank"
            pos="absolute"
            right={10}
            bottom={10}
            leftIcon={<Icon as={FiHelpCircle} />}
          >
            Help & Documentation
          </Button>
        </Container>
        <DeciEditor workspaceId={randomId} padId={randomId} />
      </Box>
    </AnonymousRuntimeProvider>
  );
}
