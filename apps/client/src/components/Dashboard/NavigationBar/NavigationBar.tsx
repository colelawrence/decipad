import {
  Avatar,
  Heading,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/client';
import Image from 'next/image';
import React from 'react';
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';

export const NavigationBar = () => {
  const [session] = useSession();

  return (
    <HStack justifyContent="space-between" pb={5} px={10}>
      <HStack alignItems="center">
        <Image src="/assets/deci-logo-brand.png" width="50px" height="50px" />
        <Heading>Deci.</Heading>
      </HStack>
      {session && (
        <HStack>
          <Heading fontSize="xl" pr={5}>
            {session.user.name}
          </Heading>
          <Menu placement="left-start">
            <MenuButton>
              <Avatar name={session.user.name} src={session.user.image} />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon as={FiUser} />}>Account</MenuItem>
              <MenuItem icon={<Icon as={FiLogOut} />} onClick={() => signOut()}>
                Sign Out
              </MenuItem>
              <MenuItem icon={<Icon as={FiSettings} />}>Settings</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      )}
    </HStack>
  );
};
