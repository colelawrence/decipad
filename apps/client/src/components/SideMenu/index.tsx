import { useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import {
  GetWorkspaceById_getWorkspaceById,
  GET_WORKSPACES,
  Workspaces,
} from '@decipad/queries';
import React, { useMemo } from 'react';
import { FiChevronDown, FiFolder } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';
import { NewWorkspaceOption } from './NewWorkspaceOption';
import { WorkspacePreferences } from './WorkspacePreferences';

export interface SideMenuProps {
  currentWorkspace: GetWorkspaceById_getWorkspaceById | null | undefined;
}

export const SideMenu = ({ currentWorkspace }: SideMenuProps) => {
  const history = useHistory();
  const { data } = useQuery<Workspaces>(GET_WORKSPACES);

  const allOtherWorkspaces = useMemo(
    () => data?.workspaces.filter((w) => w.id !== currentWorkspace?.id),
    [currentWorkspace?.id, data?.workspaces]
  );

  return (
    <Box
      d="flex"
      flexDir="column"
      justifyContent="space-between"
      borderRight="2px solid"
      borderColor="gray.100"
      pr={6}
      pt={6}
    >
      <Menu placement="right-start">
        <MenuButton as={Button} w="100%" mb={3}>
          <Flex justifyContent="space-between" alignItems="center">
            <Flex>
              <Icon as={FiFolder} mr={3} />{' '}
              <Text>{currentWorkspace?.name}</Text>
            </Flex>
            <Icon as={FiChevronDown} />
          </Flex>
        </MenuButton>
        <MenuList>
          <Text pl={3} pb={3} pt={1} opacity={0.7}>
            Workspaces
          </Text>
          {allOtherWorkspaces?.map((w) => (
            <MenuItem
              key={w.id}
              icon={<Icon as={FiFolder} />}
              onClick={() => history.push(`/workspaces/${w.id}`)}
            >
              {w.name}
            </MenuItem>
          ))}
          <MenuDivider />
          <NewWorkspaceOption />
        </MenuList>
      </Menu>
      <WorkspacePreferences currentWorkspace={currentWorkspace} />
    </Box>
  );
};
