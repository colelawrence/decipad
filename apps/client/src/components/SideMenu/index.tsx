import { useQuery } from '@apollo/client';
import { WorkspaceSwitcher } from '@decipad/ui';
import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Text,
} from '@chakra-ui/react';
import {
  GetWorkspaceById_getWorkspaceById,
  GET_WORKSPACES,
  GetWorkspaces,
} from '@decipad/queries';
import React, { useMemo } from 'react';
import { FiChevronDown, FiFolder } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';

import { WorkspacePreferences } from './WorkspacePreferences';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export interface SideMenuProps {
  currentWorkspace: GetWorkspaceById_getWorkspaceById;
}

export const SideMenu = ({ currentWorkspace }: SideMenuProps) => {
  const history = useHistory();
  const { data } = useQuery<GetWorkspaces>(GET_WORKSPACES);

  const allOtherWorkspaces = useMemo(
    () => data?.workspaces.filter((w) => w.id !== currentWorkspace.id),
    [currentWorkspace.id, data?.workspaces]
  );

  return (
    <>
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
          <MenuList p={0} border="none" outline="none">
            <WorkspaceSwitcher
              Heading="h1"
              activeWorkspace={{
                ...currentWorkspace,
                href: `/workspaces/${currentWorkspace.id}`,
                numberOfMembers: 1,
              }}
              otherWorkspaces={
                allOtherWorkspaces?.map((workspace) => ({
                  ...workspace,
                  href: `/workspaces/${workspace.id}`,
                  numberOfMembers: 1,
                })) ?? []
              }
              onCreateWorkspace={() =>
                history.push(
                  `/workspaces/${currentWorkspace.id}/create-workspace`
                )
              }
            />
          </MenuList>
        </Menu>
        <WorkspacePreferences currentWorkspace={currentWorkspace} />
      </Box>
      <CreateWorkspaceModal />
    </>
  );
};
