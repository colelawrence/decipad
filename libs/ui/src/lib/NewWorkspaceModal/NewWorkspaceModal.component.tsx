import { Modal } from '@chakra-ui/modal';
import {
  Button,
  Flex,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';

export interface NewWorkspaceModalProps {
  openButton: (onOpen: () => void) => JSX.Element;
  createWorkspace: (value: string) => void;
}

export const NewWorkspaceModal = ({
  openButton,
  createWorkspace,
}: NewWorkspaceModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    createWorkspace(value);
  };

  return (
    <>
      {openButton(onOpen)}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton _focus={{ outline: 'none' }} />
          <ModalHeader pb={0}>Create new workspace</ModalHeader>
          <ModalBody pt={3}>
            <Text opacity={0.7}>
              Workspaces are shared places where teams can collaborate. After
              creating your workspace, you can invite your team members.
            </Text>
            <Flex as="form" py={5} onSubmit={onSubmit}>
              <Input
                type="text"
                required
                focusBorderColor="none"
                placeholder="Workspace name"
                borderTopRightRadius="0"
                borderBottomRightRadius="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button
                type="submit"
                colorScheme="blue"
                borderTopLeftRadius="0"
                borderBottomLeftRadius="0"
                px={7}
              >
                Create
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
