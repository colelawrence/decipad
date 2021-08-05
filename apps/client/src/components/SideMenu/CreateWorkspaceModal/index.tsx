import { useMutation } from '@apollo/client';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import {
  CreateWorkspace,
  CreateWorkspaceVariables,
  CREATE_WORKSPACE,
} from '@decipad/queries';
import React, { FC, useRef } from 'react';
import { Route, useHistory, useRouteMatch } from 'react-router-dom';

export const CreateWorkspaceModal = (): ReturnType<FC> => {
  const { path, url } = useRouteMatch();

  const history = useHistory();
  const handleClose = () => history.push(url);
  const newWorkspaceRef = useRef<HTMLInputElement>(null);

  const [mutate] =
    useMutation<CreateWorkspace, CreateWorkspaceVariables>(CREATE_WORKSPACE);

  const createNewWorkspace = () => {
    mutate({
      variables: { name: newWorkspaceRef?.current?.value || '' },
      refetchQueries: ['GetWorkspaces'],
      awaitRefetchQueries: true,
    }).then((res) => {
      history.push(`/workspaces/${res.data?.createWorkspace.id}`);
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createNewWorkspace();
  };

  return (
    <Route path={`${path}/create-workspace`}>
      <Modal isOpen onClose={handleClose} initialFocusRef={newWorkspaceRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Workspace</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSubmit}>
              <Input
                type="text"
                ref={newWorkspaceRef}
                placeholder="Workspace name..."
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => createNewWorkspace()}>
              Create Workspace
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Route>
  );
};
