import { gql, useQuery } from '@apollo/client';
import { Heading } from '@chakra-ui/react';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useRouter } from 'next/router';
import React from 'react';

const GET_WORKSPACES = gql`
  query GetAllWorkspaces {
    workspaces {
      id
      name
    }
  }
`;

const Workspace = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading } = useQuery(GET_WORKSPACES);

  const currentWorkspace =
    data && data.workspaces.filter((w: any) => w.id === id);

  if (loading) {
    return <LoadingSpinnerPage />;
  }

  return (
    <>
      <Heading>Current Workspace</Heading>
      {JSON.stringify(currentWorkspace)}
    </>
  );
};

export default Workspace;
