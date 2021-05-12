import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
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
import React from 'react';
import { useForm } from 'react-hook-form';

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
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

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
            <form onSubmit={handleSubmit(onDelete)}>
              <Text pb={2}>
                To confirm the deletion, type <strong>{name}</strong> in the
                field below.
              </Text>
              <FormControl isInvalid={errors.workspace !== undefined}>
                <Input
                  type="text"
                  {...register('workspace', {
                    validate: (value) => value === name,
                  })}
                />
                {errors.workspace && (
                  <FormErrorMessage>
                    Invalid workspace name, try again
                  </FormErrorMessage>
                )}
              </FormControl>
              <ButtonGroup d="flex" pt={4} pb={2} justifyContent="flex-end">
                <Button type="submit" colorScheme="red" mr={3}>
                  Yes, delete
                </Button>
                <Button onClick={onClose} variant="ghost">
                  Cancel
                </Button>
              </ButtonGroup>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
