import { useQuery } from '@apollo/client';
import { Box, Button, Container, Heading, Icon } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
} from '@decipad/queries';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const Pad = () => {
  const router = useRouter();
  const { id, pid } = router.query;

  const { data, loading, error } = useQuery<GetPadById, GetPadByIdVariables>(
    GET_PAD_BY_ID,
    {
      variables: { id: pid as string },
    }
  );

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  if (error) return <>{JSON.stringify(error)}</>;

  return (
    <Box minH="100vh">
      <Button
        pos="absolute"
        top={12}
        left={12}
        aria-label="go back"
        leftIcon={<Icon as={FiArrowLeft} />}
        onClick={() => router.back()}
      >
        Go Back
      </Button>
      <Container maxW="75ch" pt={12}>
        <Heading mb={3}>{data?.getPadById?.name}</Heading>
      </Container>
      <DeciEditor workspaceId={id as string} padId={pid as string} />
    </Box>
  );
};

export default Pad;
