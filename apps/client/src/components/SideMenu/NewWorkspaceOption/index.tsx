import { useMutation } from '@apollo/client';
import {
  Button,
  Icon,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import {
  CreateWorkspace,
  CreateWorkspaceVariables,
  CREATE_WORKSPACE,
} from '@decipad/queries';
import React, { useRef } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';

export const NewWorkspaceOption = () => {
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      onClose();
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createNewWorkspace();
  };

  return (
    <>
      <MenuItem opacity={0.7} icon={<Icon as={FiPlus} />} onClick={onOpen}>
        New Workspace
      </MenuItem>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={newWorkspaceRef}
      >
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
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => createNewWorkspace()}>
              Create Workspace
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
