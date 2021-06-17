import { useQuery } from '@apollo/client';
import { Container, Heading } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
} from '@decipad/queries';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useRouter } from 'next/router';
import React from 'react';

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
    <Container maxW="75ch" py={10}>
      <Heading mb={3}>{data?.getPadById?.name}</Heading>
      <DeciEditor workspaceId={id as string} padId={pid as string} />
    </Container>
  );
};

export default Pad;
