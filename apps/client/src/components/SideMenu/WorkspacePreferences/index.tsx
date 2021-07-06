import {
  Button,
  Heading,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import {
  GetWorkspaceById_getWorkspaceById,
  useRenameWorkspace,
} from '@decipad/queries';
import { FormEvent, useRef, useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import { DeleteWorkspace } from './DeleteWorkspace/DeleteWorkspace';

export interface WorkspacePreferencesProps {
  currentWorkspace: GetWorkspaceById_getWorkspaceById | null | undefined;
}

export const WorkspacePreferences = ({
  currentWorkspace,
}: WorkspacePreferencesProps) => {
  const renameInputRef = useRef(null);
  const [name, setName] = useState(currentWorkspace?.name || '');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [renameMutate] = useRenameWorkspace({
    id: currentWorkspace?.id || '',
    name,
  });

  const renameWorkspace = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    renameMutate();
    onClose();
  };

  return (
    <>
      <Button leftIcon={<Icon as={FiSettings} />} onClick={onOpen}>
        Workspace Preferences
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={renameInputRef}>
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
              onClose={onClose}
              currentWorkspace={currentWorkspace}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
