import { Route, useHistory, useRouteMatch } from 'react-router-dom';
import {
  Button,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import {
  GetWorkspaceById_getWorkspaceById,
  useRenameWorkspace,
} from '@decipad/queries';
import React, { FC, FormEvent, useRef, useState } from 'react';
import { DeleteWorkspace } from './DeleteWorkspace/DeleteWorkspace';

export interface WorkspacePreferencesProps {
  currentWorkspace: GetWorkspaceById_getWorkspaceById | null | undefined;
}

export const WorkspacePreferences = ({
  currentWorkspace,
}: WorkspacePreferencesProps): ReturnType<FC> => {
  const history = useHistory();
  const { path, url } = useRouteMatch();

  const renameInputRef = useRef(null);
  const [name, setName] = useState(currentWorkspace?.name || '');
  const [renameMutate] = useRenameWorkspace({
    id: currentWorkspace?.id || '',
    name,
  });

  const handleClose = () => {
    history.push(url);
  };

  const renameWorkspace = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    renameMutate();
    handleClose();
  };

  return (
    <Route path={`${path}/preferences`}>
      <Modal isOpen onClose={handleClose} initialFocusRef={renameInputRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{name} Preferences</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Heading mb={3} size="sm">
              Rename Workspace
            </Heading>
            <form onSubmit={renameWorkspace}>
              <Input
                type="text"
                placeholder={currentWorkspace?.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                ref={renameInputRef}
              />
              <Button w="100%" type="submit" colorScheme="messenger" mt={3}>
                Rename
              </Button>
            </form>

            <DeleteWorkspace
              onClose={handleClose}
              currentWorkspace={currentWorkspace}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Route>
  );
};
