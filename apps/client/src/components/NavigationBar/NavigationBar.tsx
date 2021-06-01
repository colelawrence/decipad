import { Avatar } from '@chakra-ui/avatar';
import Icon from '@chakra-ui/icon';
import { Image } from '@chakra-ui/image';
import { Heading, HStack } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { signOut } from 'next-auth/client';
import React, { useContext } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { DeciRuntimeContext } from '@decipad/editor';

export const NavigationBar = () => {
  const { runtime } = useContext(DeciRuntimeContext);
  const session = runtime.getSessionValue();

  return (
    <HStack justifyContent="space-between" px={9}>
      <Image
        src="/assets/deci-logo-brand.png"
        alt="Brand"
        width="60px"
        height="60px"
      />
      <HStack>
        <Heading fontSize="2xl" pr={3}>
          {session.user.name}
        </Heading>
        <Menu>
          <MenuButton>
            <Avatar src={session && session.user.image} />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => signOut()}>
              <Icon as={FiLogOut} mr={3} />
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </HStack>
  );
};
