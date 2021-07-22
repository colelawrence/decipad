import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import {
  CreatePad,
  CreatePadVariables,
  CREATE_PAD,
  CountPads,
  CountPadsVariables,
  COUNT_PADS,
  GetPadsVariables,
  GET_PADS,
  GET_WORKSPACES,
} from '@decipad/queries';
import { DashboardTopbar } from '@decipad/ui';
import { signOut, useSession } from 'next-auth/client';
import { useToasts } from 'react-toast-notifications';
import { encode as encodeVanityUrlComponent } from '../../lib/vanityUrlComponent';
import { getSafeUsername } from '@decipad/interfaces';

export const Topbar = ({ workspaceId }: { workspaceId: string }) => {
  const history = useHistory();
  const [session] = useSession();
  if (!session || !session.user) {
    throw new Error(
      'The dashboard topbar requires an active session and user account'
    );
  }

  const { data } = useQuery<CountPads, CountPadsVariables>(COUNT_PADS, {
    variables: { workspaceId },
  });

  const [creatingPad, setCreatingPad] = useState(false);
  const [createPad] = useMutation<CreatePad, CreatePadVariables>(CREATE_PAD, {
    refetchQueries: [
      { query: GET_WORKSPACES },
      { query: COUNT_PADS, variables: { workspaceId } as CountPadsVariables },
      { query: GET_PADS, variables: { workspaceId } as GetPadsVariables },
    ],
  });

  const { addToast } = useToasts();

  const onNewPad = useCallback(async () => {
    if (!creatingPad) {
      setCreatingPad(true);
      try {
        const { data } = await createPad({
          variables: {
            workspaceId,
            name: '',
          },
        });
        const newPad = data!.createPad!;
        addToast('Pad created successfully', { appearance: 'success' });
        history.push(
          `/workspaces/${workspaceId}/pads/${encodeVanityUrlComponent(
            '',
            newPad.id
          )}`
        );
      } catch (err) {
        addToast('Error creating pad: ' + err.message, {
          appearance: 'error',
        });
      } finally {
        setCreatingPad(false);
      }
    }
  }, [creatingPad, createPad, workspaceId, addToast, history]);

  return (
    <DashboardTopbar
      userName={getSafeUsername(session.user)}
      email={session.user.email ?? ''}
      onLogout={signOut}
      onCreateNotebook={onNewPad}
      numberOfNotebooks={data?.pads.count}
    />
  );
};
