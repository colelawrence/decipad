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
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { GetWorkspaceById_getWorkspaceById } from '@decipad/queries';
import React from 'react';
import { FiSettings } from 'react-icons/fi';

interface WorkspacePreferencesProps {
  currentWorkspace: GetWorkspaceById_getWorkspaceById | null | undefined;
}

export const WorkspacePreferences = ({
  currentWorkspace,
}: WorkspacePreferencesProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button leftIcon={<Icon as={FiSettings} />} onClick={onOpen}>
        Workspace Preferences
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Workspace Preferences</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Heading mb={3} size="sm">
              Rename Workspace
            </Heading>
            <form>
              <Input type="text" placeholder={currentWorkspace?.name} />
              <Button w="100%" type="submit" colorScheme="messenger" mt={3}>
                Rename
              </Button>
            </form>

            <Heading mt={6} mb={3} size="sm">
              Delete Workspace
            </Heading>
            <Text color="red.500">
              Are you sure you want to delete your workspace? This will also
              delete all of the pads associated with the workspace.
            </Text>
            <Button colorScheme="red" w="100%" mt={3}>
              I am sure, delete
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
