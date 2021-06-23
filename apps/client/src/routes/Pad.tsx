import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Button,
  Container,
  Icon,
  Editable,
  EditablePreview,
  EditableInput,
} from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import {
  GetPadById,
  GetPadByIdVariables,
  GET_PAD_BY_ID,
  GetPadById_getPadById,
  RenamePad,
  RenamePadVariables,
  RENAME_PAD,
} from '@decipad/queries';
import { HelpButton, LoadingSpinnerPage } from '@decipad/ui';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

export function Pad({
  workspaceId,
  padId,
}: {
  workspaceId: string;
  padId: string;
}) {
  const { addToast } = useToasts();
  const { data, loading, error, refetch } = useQuery<
    GetPadById,
    GetPadByIdVariables
  >(GET_PAD_BY_ID, {
    variables: { id: padId },
  });
  const pad = data?.getPadById;
  const [mutate] = useMutation<RenamePad, RenamePadVariables>(RENAME_PAD);
  const [renaming, setRenaming] = useState(false);
  const renamePad = useCallback(
    (name: string) => {
      if (!renaming && pad && name !== pad.name) {
        setRenaming(true);
        mutate({ variables: { padId, name } })
          .then(() => {
            addToast('Pad renamed successfully', { appearance: 'success' });
            refetch().catch((err) =>
              addToast('Error refetching the pad: ' + err.message, {
                appearance: 'error',
              })
            );
          })
          .catch((err) =>
            addToast('Error renaming pad: ' + err.message, {
              appearance: 'error',
            })
          )
          .finally(() => setRenaming(false));
      }
    },
    [renaming, pad, mutate, padId, addToast, setRenaming, refetch]
  );

  useEffect(() => {
    if (error) {
      addToast('Error fetching the pad: ' + error.message, {
        appearance: 'error',
      });
    }
  }, [error, addToast]);

  if (loading || !pad) {
    return <LoadingSpinnerPage />;
  }

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
        <PadTitleEditor pad={pad!} onPadNameChanged={renamePad} />
      </Container>
      <DeciEditor
        padId={padId}
        autoFocus={!!pad!.name}
      />
      <HelpButton />
    </Box>
  );
}

function PadTitleEditor({
  pad,
  onPadNameChanged,
}: {
  pad: GetPadById_getPadById;
  onPadNameChanged: (title: string) => void;
}) {
  const [name, setName] = useState<string>(pad.name || '');
  const onSubmit = useCallback(() => {
    if (name !== pad.name) {
      onPadNameChanged(name);
    }
  }, [onPadNameChanged, name, pad.name]);

  const noPadName = !pad.name;

  return (
    <Editable
      type="text"
      placeholder="Pad name"
      fontSize="3xl"
      fontWeight="bold"
      value={name}
      startWithEditView={noPadName}
      onChange={setName}
      onSubmit={onSubmit}
    >
      <EditablePreview />
      <EditableInput autoFocus={noPadName} />
    </Editable>
  );
}
