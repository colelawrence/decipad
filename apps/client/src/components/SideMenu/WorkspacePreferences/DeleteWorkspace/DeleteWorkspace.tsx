import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Button, Collapse, Heading, Input, Text } from '@chakra-ui/react';
import {
  GET_WORKSPACES,
  useDeleteWorkspace,
  GetWorkspaces,
} from '@decipad/queries';
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { WorkspacePreferencesProps } from '..';

interface DeleteWorkspaceProps extends WorkspacePreferencesProps {
  onClose: () => void;
}

export const DeleteWorkspace = ({
  currentWorkspace,
  onClose,
}: DeleteWorkspaceProps) => {
  const { data } = useQuery<GetWorkspaces>(GET_WORKSPACES);
  const [deleteValue, setDeleteValue] = useState('');
  const [deleteMutation] = useDeleteWorkspace({
    id: currentWorkspace?.id || '',
  });
  const matches = useMemo(
    () => deleteValue === currentWorkspace?.name,
    [deleteValue, currentWorkspace?.name]
  );
  const history = useHistory();
  const { addToast } = useToasts();

  if (data?.workspaces.length === 1) return null;

  return (
    <>
      <Heading mt={6} mb={3} size="sm" color="red.500">
        Delete Workspace
      </Heading>
      <Input
        type="text"
        placeholder="Type workspace name to confirm..."
        value={deleteValue}
        focusBorderColor="red.500"
        onChange={(e) => setDeleteValue(e.target.value)}
      />
      <Collapse in={matches}>
        <Text mt={3} color="red.500">
          Are you sure you want to delete your workspace? This will also delete
          all of the pads associated with the workspace.
        </Text>
        <Button
          colorScheme="red"
          mt={3}
          w="100%"
          disabled={!matches}
          onClick={() => {
            deleteMutation()
              .then(() => {
                addToast('Workspace successfully deleted', {
                  appearance: 'success',
                });
                onClose();

                history.push(`/`);
              })
              .catch((err) => {
                addToast('Error deleting workspace: ' + err.message, {
                  appearance: 'error',
                });
              });
          }}
        >
          I am sure, delete
        </Button>
      </Collapse>
    </>
  );
};
