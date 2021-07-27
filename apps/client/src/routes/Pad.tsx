import { useQuery } from '@apollo/client';
import { Button, Icon } from '@chakra-ui/react';
import { Editor } from '@decipad/editor';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
} from '@decipad/queries';
import { HelpButton, LoadingSpinnerPage } from '@decipad/ui';
import { useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { encode as encodeVanityUrlComponent } from '../lib/vanityUrlComponent';

export function Pad({
  workspaceId,
  padId,
}: {
  workspaceId: string;
  padId: string;
}) {
  const { addToast } = useToasts();
  const { data, loading, error } = useQuery<GetPadById, GetPadByIdVariables>(
    GET_PAD_BY_ID,
    {
      variables: { id: padId },
    }
  );
  const pad = data?.getPadById;
  useEffect(() => {
    if (error) {
      addToast('Error fetching the pad: ' + error.message, {
        appearance: 'error',
      });
    }
  }, [error, addToast]);

  const history = useHistory();

  const padName = pad?.name || '';
  const pathName = history.location.pathname;

  useEffect(() => {
    if (!pad) {
      return;
    }
    const url = `/workspaces/${workspaceId}/pads/${encodeVanityUrlComponent(
      padName,
      padId
    )}`;
    if (url !== pathName) {
      history.replace(url);
    }
  }, [pad, padName, pathName, history, workspaceId, padId]);

  if (loading || !pad) {
    return <LoadingSpinnerPage />;
  }

  return (
    <>
      <Button
        as={Link}
        to={`/workspaces/${workspaceId}`}
        pos="absolute"
        zIndex="999"
        top={12}
        left={12}
        aria-label="go back"
        leftIcon={<Icon as={FiArrowLeft} />}
      >
        Go Back
      </Button>
      <Editor padId={padId} autoFocus={!!pad!.name} />
      <HelpButton />
    </>
  );
}
