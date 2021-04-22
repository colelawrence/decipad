import {
  Button,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import React from 'react';
import {
  FiChevronDown,
  FiDollarSign,
  FiLogOut,
  FiSettings,
  FiUser,
} from 'react-icons/fi';

export const ProfileMenu = () => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        rightIcon={<Icon as={FiChevronDown} />}
      >
        <Image
          borderRadius="full"
          src="http://placekitten.com/30/30"
          alt="Profile"
        />
      </MenuButton>
      <MenuList>
        <MenuItem icon={<Icon as={FiUser} />}>Profile Settings</MenuItem>
        <MenuItem icon={<Icon as={FiSettings} />}>Account Settings</MenuItem>
        <MenuItem icon={<Icon as={FiDollarSign} />}>Billing</MenuItem>
        <MenuItem icon={<Icon as={FiLogOut} />}>Sign Out</MenuItem>
      </MenuList>
    </Menu>
  );
};
