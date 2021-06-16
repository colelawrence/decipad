import { nanoid } from 'nanoid';
import { useEffect, useMemo } from 'react';
import { Container, Heading, Text } from '@chakra-ui/react';
import { AnonymousRuntimeProvider, DeciEditor } from '@decipad/editor';

export default function Playground() {
  const randomId = useMemo(() => nanoid(), []);

  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  return (
    <AnonymousRuntimeProvider>
      <Container p={12} maxW="75ch">
        <Heading>Deci Playground</Heading>
        <Text opacity={0.7} mt={3} mb={6}>
          This is a lightweight version of Deci, here you only get one pad. This
          version is intended just to test out how our pads work, play around
          and have fun!
        </Text>
        <DeciEditor workspaceId={randomId} padId={randomId} />
      </Container>
    </AnonymousRuntimeProvider>
  );
}
