import { Button, ButtonGroup } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import Icon from '@chakra-ui/icon';
import { Box } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { FiEdit2, FiFolder, FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import { v4 } from 'uuid';
import { useWorkspaces, Workspace } from '../../../workspaces.store';
import { DeleteWorkspaceButton } from './DeleteWorkspaceButton/DeleteWorkspaceButton';

export const Item = ({ workspace }: { workspace: Workspace }) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const newNotebookRef = useRef<HTMLInputElement>(null);
  const set = useWorkspaces((state) => state.set);
  const [newNotebookName, setNewNotebookName] = useState('');
  return (
    <Box pt={2}>
      <ButtonGroup
        w="100%"
        bg={router.query.workspace === workspace.id ? 'blue.50' : 'transparent'}
        _hover={{ bg: 'blue.50' }}
        transition="0.2s ease-out"
        borderRadius={5}
      >
        <Link href={`/?workspace=${workspace.id}`}>
          <Button
            bg="transparent"
            w="100%"
            fontWeight="normal"
            _hover={{ bg: 'transparent' }}
            _focus={{ bg: 'transparent' }}
            _active={{ bg: 'transparent' }}
            justifyContent="flex-start"
            leftIcon={<Icon as={FiFolder} />}
          >
            {workspace.name}
          </Button>
        </Link>
        <Menu>
          <MenuButton px={4}>
            <Icon as={FiMoreHorizontal} />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<Icon as={FiPlus} />} onClick={onOpen}>
              New Notebook
            </MenuItem>
            <MenuItem icon={<Icon as={FiEdit2} />}>Rename</MenuItem>
            <DeleteWorkspaceButton id={workspace.id} />
          </MenuList>
        </Menu>
      </ButtonGroup>
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={newNotebookRef}>
        <ModalOverlay />
        <ModalContent pb={5}>
          <ModalHeader>New Notebook</ModalHeader>
          <ModalBody>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                set((state) => {
                  state.workspaces.map((w) =>
                    w.id === workspace.id
                      ? w.notebooks.push({
                          id: v4(),
                          name: newNotebookName,
                        })
                      : w
                  );
                });
                setNewNotebookName('');
                onClose();
              }}
            >
              <Input
                type="text"
                ref={newNotebookRef}
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                placeholder="Untitled"
              />
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
