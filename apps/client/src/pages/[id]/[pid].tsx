import { gql, useQuery } from '@apollo/client';
import { Heading } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useRouter } from 'next/router';
import React from 'react';

const GET_PADS = gql`
  query GetAllPads($id: ID!) {
    pads(workspaceId: $id, page: { cursor: "", maxItems: 5 }) {
      items {
        id
        name
      }
    }
  }
`;

const Pad = () => {
  const router = useRouter();
  const { id, pid } = router.query;

  const { data, loading, error } = useQuery(GET_PADS, {
    variables: { id },
  });

  const currentPad = data && data.pads.items.filter((p: any) => p.id === pid);

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  if (error) return <>{JSON.stringify(error)}</>;

  return (
    <>
      <Heading>Current Pad</Heading>
      {JSON.stringify(currentPad)}
      <DeciEditor workspaceId={id as string} padId={pid as string} />
    </>
  );
};

export default Pad;
