import { useQuery } from '@apollo/client';
import { Heading } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import { LoadingSpinnerPage } from '@decipad/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { GET_PAD_BY_ID } from '../../operations/queries/GET_PAD_BY_ID';
import {
  GetPadById,
  GetPadByIdVariables,
} from '../../operations/queries/__generated__/GetPadById';

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
    <>
      <Heading>Current Pad</Heading>
      {JSON.stringify(data?.getPadById?.name)}
      <DeciEditor workspaceId={id as string} padId={pid as string} />
    </>
  );
};

export default Pad;
