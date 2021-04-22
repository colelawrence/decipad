import { Button } from '@chakra-ui/button';
import {
  Box,
  Divider,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FiChevronDown, FiPlus, FiShare2 } from 'react-icons/fi';
import { NewWorkspaceModal } from '../../Modals/NewWorkspaceModal/NewWorkspaceModal.component';

export const CurrentWorkspace = () => {
  return (
    <Menu placement="right-start">
      <MenuButton
        w="100%"
        maxW="300px"
        textAlign="left"
        bg="transparent"
        _hover={{ bg: 'blackAlpha.100' }}
        _focus={{ bg: 'blackAlpha.100' }}
        _active={{ bg: 'blackAlpha.100' }}
        as={Button}
        rightIcon={<Icon as={FiChevronDown} />}
      >
        <Image
          src="http://placekitten.com/20/20"
          alt="Workspace icon"
          d="inline-block"
          borderRadius="5"
          mr={3}
        />{' '}
        Deci
      </MenuButton>
      <MenuList>
        <Box px={3} pb={3} pt={2}>
          <Image
            src="http://placekitten.com/20/20"
            alt="Workspace icon"
            d="inline-block"
            borderRadius="5"
          />{' '}
          <Text ml={3} d="inline-block" fontWeight="bold">
            Deci
          </Text>
        </Box>
        <MenuItem mb={3} icon={<Icon as={FiShare2} />}>
          Invite people
        </MenuItem>
        <Divider mb={3} />
        <MenuItem
          icon={
            <Image
              src="http://placekitten.com/20/20"
              borderRadius="5"
              alt="option"
            />
          }
        >
          Personal
        </MenuItem>
        <MenuItem
          icon={
            <Image
              src="http://placekitten.com/20/20"
              borderRadius="5"
              alt="option"
            />
          }
        >
          Bubble
        </MenuItem>
        <NewWorkspaceModal
          openButton={(onOpen) => (
            <MenuItem
              icon={<Icon as={FiPlus} />}
              opacity={0.7}
              onClick={onOpen}
            >
              Create new workspace
            </MenuItem>
          )}
          createWorkspace={() => console.log('created')}
        />
      </MenuList>
    </Menu>
  );
};
