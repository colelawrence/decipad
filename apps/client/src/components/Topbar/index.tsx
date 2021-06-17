import { useMutation } from '@apollo/client';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { CreatePad, CreatePadVariables, CREATE_PAD } from '@decipad/queries';
import { signOut, useSession } from 'next-auth/client';
import React, { useRef } from 'react';
import { FiChevronDown, FiLogOut, FiPlus } from 'react-icons/fi';

export const Topbar = ({ workspaceId }: { workspaceId: string }) => {
  const [session] = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ref = useRef<HTMLInputElement>(null);

  const [createPad] = useMutation<CreatePad, CreatePadVariables>(CREATE_PAD);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPad({
      variables: {
        workspaceId,
        name: ref.current?.value || '',
      },
      refetchQueries: ['GetWorkspaceById'],
      awaitRefetchQueries: true,
    });
    onClose();
  };
  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <Image
          src="/assets/deci-logo-brand.png"
          alt="Brand"
          width={50}
          ml={3}
          height={50}
          borderRadius="5px"
        />

        <Box>
          <Button onClick={onOpen} leftIcon={<Icon as={FiPlus} />}>
            New Pad
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              bg="transparent"
              outline="none"
              _hover={{ bg: 'transparent', outline: 'none' }}
              _focus={{ bg: 'transparent', outline: 'none' }}
              _active={{ bg: 'transparent', outline: 'none' }}
              rightIcon={<Icon as={FiChevronDown} />}
            >
              <Flex alignItems="center">
                <Heading size="md" mr={3}>
                  {session?.user?.name}
                </Heading>
                <Avatar
                  size="sm"
                  name={session?.user?.name || ''}
                  src={session?.user?.image || ''}
                />
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon as={FiLogOut} />} onClick={() => signOut()}>
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={ref}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new pad</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={3}>
            <form onSubmit={onSubmit}>
              <Input ref={ref} type="text" placeholder="Pad name" />
              <ButtonGroup mt={3} d="flex" justifyContent="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" colorScheme="messenger">
                  Create
                </Button>
              </ButtonGroup>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
