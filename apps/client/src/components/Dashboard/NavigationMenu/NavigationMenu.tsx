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
import { DeciRuntimeContext } from '@decipad/editor';
import { CurrentWorkspace } from '@decipad/ui';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  FiClock,
  FiInbox,
  FiLayers,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import { Subscription } from 'rxjs';
import { Workspaces } from './Workspaces/Workspaces';

export const NavigationMenu = ({ workspaceId }: { workspaceId: string }) => {
  const router = useRouter();
  const newWorkspaceRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentWorkspace, setCurrentWorkspace] = useState<any>({});
  const [workspacesIds, setWorkspacesIds] = useState<string[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const { runtime } = useContext(DeciRuntimeContext);

  useEffect(() => {
    let sub: Subscription;
    let sub2: Subscription;

    if (runtime) {
      sub = runtime.workspaces
        .get(workspaceId)
        .subscribe(({ data: workspace }) => {
          setCurrentWorkspace(workspace);
        });

      sub2 = runtime.workspaces.list().subscribe(({ data }) => {
        setWorkspacesIds(data.filter((d: string) => d !== workspaceId));
      });
    }

    return () => {
      sub.unsubscribe();
      sub2.unsubscribe();
    };
  }, [runtime, workspaceId]);

  return (
    <Box px={5} borderRight="1px solid" borderColor="gray.100">
      <CurrentWorkspace
        runtime={runtime}
        currentWorkspace={currentWorkspace}
        workspaces={workspacesIds}
      />
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
        {runtime && (
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
                    await runtime.workspaces.create(newWorkspace);
                    await runtime.workspaces.push(newWorkspace.id);
                    router.push(`?workspace=${newWorkspace.id}`);
                    onClose();
                    router.push(`?workspace=${newWorkspace.id}`);
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
        )}
      </Flex>
      <Workspaces />
    </Box>
  );
};
