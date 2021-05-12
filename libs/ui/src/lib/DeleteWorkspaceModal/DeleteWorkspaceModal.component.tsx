import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';

export interface DeleteWorkspaceModalProps {
  name: string;
  onDelete: () => void;
  openButton: (onOpen: () => void) => JSX.Element;
}

export const DeleteWorkspaceModal = ({
  name,
  onDelete,
  openButton,
}: DeleteWorkspaceModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      {openButton(onOpen)}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton _focus={{ outline: 'none' }} />
          <ModalHeader pb={0}>Delete {name} ?</ModalHeader>
          <ModalBody pt={3}>
            <Text opacity={0.7}>
              Are you sure you want to delete this workspace? All notebooks and
              users will be removed.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={onDelete} mr={3}>
              Yes, delete
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
