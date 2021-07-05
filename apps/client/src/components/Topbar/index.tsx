import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { CreatePad, CreatePadVariables, CREATE_PAD } from '@decipad/queries';
import { signOut, useSession } from 'next-auth/client';
import { FiChevronDown, FiLogOut, FiPlus } from 'react-icons/fi';
import { useToasts } from 'react-toast-notifications';
import { encode as encodeVanityUrlComponent } from '../../lib/vanityUrlComponent';

export const Topbar = ({ workspaceId }: { workspaceId: string }) => {
  const [session] = useSession();
  const history = useHistory();
  const [createPad] = useMutation<CreatePad, CreatePadVariables>(CREATE_PAD);
  const { addToast } = useToasts();
  const [creatingPad, setCreatingPad] = useState(false);

  const onNewPad = useCallback(() => {
    setCreatingPad(true);
    createPad({
      variables: {
        workspaceId,
        name: '',
      },
    })
      .then((result) => {
        const newPad = result.data!.createPad!;
        addToast('Pad created successfully', { appearance: 'success' });
        history.push(
          `/workspaces/${workspaceId}/pads/${encodeVanityUrlComponent(
            '',
            newPad.id
          )}`
        );
      })
      .catch((err) =>
        addToast('Error creating pad: ' + err.message, {
          appearance: 'error',
        })
      );
  }, [setCreatingPad, createPad, workspaceId, addToast, history]);

  return (
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
        <Button
          onClick={onNewPad}
          leftIcon={<Icon as={FiPlus} />}
          disabled={creatingPad}
        >
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
  );
};
