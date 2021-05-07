import { Button } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import Icon from '@chakra-ui/icon';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useRef, useState, useContext } from 'react';
import {
  FiClock,
  FiInbox,
  FiLayers,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { nanoid } from 'nanoid';
import { DeciRuntimeContext } from '@decipad/editor';
import { Workspaces } from './Workspaces/Workspaces';

export const NavigationMenu = () => {
  const router = useRouter();
  const newWorkspaceRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { runtime } = useContext(DeciRuntimeContext);

  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  return (
    <Box px={5} borderRight="1px solid" borderColor="gray.100">
      <Button
        w="100%"
        leftIcon={<Icon as={FiInbox} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Inbox
      </Button>
      <Button
        w="100%"
        leftIcon={<Icon as={FiLayers} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Templates
      </Button>
      <Button
        w="100%"
        leftIcon={<Icon as={FiClock} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Recents
      </Button>
      <Button
        w="100%"
        leftIcon={<Icon as={FiTrash2} />}
        justifyContent="flex-start"
        bg="transparent"
        _hover={{ bg: 'blue.50' }}
      >
        Recycle Bin
      </Button>

      <Flex pt={5} pl={4} justifyContent="space-between" alignItems="center">
        <Text>Workspaces</Text>
        <Menu>
          <MenuButton px={4} opacity={0.5} _hover={{ opacity: 1 }}>
            <Icon as={FiMoreHorizontal} />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<Icon as={FiPlus} />} onClick={onOpen}>
              Create Workspace
            </MenuItem>
          </MenuList>
        </Menu>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          initialFocusRef={newWorkspaceRef}
        >
          <ModalOverlay />
          <ModalContent pb={5}>
            <ModalHeader>New Workspace</ModalHeader>
            <ModalBody>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const newWorkspace = {
                    id: nanoid(),
                    name: newWorkspaceName,
                    permissions: [],
                  };
                  setNewWorkspaceName('');
                  await runtime.workspaces.create(newWorkspace);
                  await runtime.workspaces.push(newWorkspace.id);
                  router.push(`?workspace=${newWorkspace.id}`);
                  onClose();
                }}
              >
                <Input
                  type="text"
                  ref={newWorkspaceRef}
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Untitled"
                />
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
      <Workspaces />
    </Box>
  );
};
