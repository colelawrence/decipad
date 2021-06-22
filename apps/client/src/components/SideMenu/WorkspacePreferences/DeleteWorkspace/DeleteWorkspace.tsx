import { useQuery } from '@apollo/client';
import { Button, Collapse, Heading, Input, Text } from '@chakra-ui/react';
import {
  GET_WORKSPACES,
  useDeleteWorkspace,
  Workspaces,
} from '@decipad/queries';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { WorkspacePreferencesProps } from '..';

interface DeleteWorkspaceProps extends WorkspacePreferencesProps {
  onClose: () => void;
}

export const DeleteWorkspace = ({
  currentWorkspace,
  onClose,
}: DeleteWorkspaceProps) => {
  const router = useRouter();
  const { data } = useQuery<Workspaces>(GET_WORKSPACES);
  const [deleteValue, setDeleteValue] = useState('');

  const [deleteMutation] = useDeleteWorkspace({
    id: currentWorkspace?.id || '',
  });

  const matches = useMemo(
    () => deleteValue === currentWorkspace?.name,
    [deleteValue, currentWorkspace?.name]
  );

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
            deleteMutation().then(() => {
              const index = data?.workspaces.findIndex(
                (workspace) => workspace.id === currentWorkspace?.id
              );
              onClose();
              router.push(`/${data?.workspaces[(index as number) + 1].id}`);
            });
          }}
        >
          I am sure, delete
        </Button>
      </Collapse>
    </>
  );
};
