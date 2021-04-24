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
import React, { useRef, useState, useContext, useEffect } from 'react';
import { FiEdit2, FiFolder, FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import { nanoid } from 'nanoid';
import { DeleteWorkspaceButton } from './DeleteWorkspaceButton/DeleteWorkspaceButton';
import { DeciRuntimeContext } from '@decipad/editor';

export const Item = ({ workspaceId }: { workspaceId: string }) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const newNotebookRef = useRef<HTMLInputElement>(null);
  const { runtime } = useContext(DeciRuntimeContext);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    const sub = runtime.workspaces
      .get(workspaceId)
      .subscribe(({ loading, data: workspace }) => {
        setLoading(loading);
        setWorkspace(workspace);
      });
  }, [runtime, workspaceId]);

  const [newNotebookName, setNewNotebookName] = useState('');

  if (loading || !workspace) {
    return <span>Loading...</span>;
  }

  return (
    <Box pt={2}>
      <ButtonGroup
        w="100%"
        bg={router.query.workspace === workspaceId ? 'blue.50' : 'transparent'}
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
            <DeleteWorkspaceButton id={workspaceId} />
          </MenuList>
        </Menu>
      </ButtonGroup>
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={newNotebookRef}>
        <ModalOverlay />
        <ModalContent pb={5}>
          <ModalHeader>New Notebook</ModalHeader>
          <ModalBody>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const newPad = {
                  id: nanoid(),
                  name: newNotebookName,
                  workspaceId,
                  permissions: [],
                  tags: [],
                  lastUpdatedAt: new Date(),
                };
                await runtime.workspace(workspaceId).pads.create(newPad);
                router.push(`?workspace=${workspaceId}&notebook=${newPad.id}`)
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
