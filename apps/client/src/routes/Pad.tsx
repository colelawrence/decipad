import { useQuery } from '@apollo/client';
import { Box, Button, Container, Heading, Icon } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
} from '@decipad/queries';
import { HelpButton, LoadingSpinnerPage } from '@decipad/ui';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export function Pad({
  workspaceId,
  padId,
}: {
  workspaceId: string;
  padId: string;
}) {
  const { data, loading, error } = useQuery<GetPadById, GetPadByIdVariables>(
    GET_PAD_BY_ID,
    {
      variables: { id: padId },
    }
  );

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  if (error) return <>{JSON.stringify(error)}</>;

  return (
    <Box minH="100vh">
      <Button
        as={Link}
        to={`/workspaces/${workspaceId}`}
        pos="absolute"
        top={12}
        left={12}
        aria-label="go back"
        leftIcon={<Icon as={FiArrowLeft} />}
      >
        Go Back
      </Button>
      <Container maxW="75ch" pt={12}>
        <Heading mb={3}>{data?.getPadById?.name}</Heading>
      </Container>
      <DeciEditor padId={padId} />
      <HelpButton />
    </Box>
  );
}
