/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CreateSectionMutation,
  useWorkspacePermission,
} from '@decipad/graphql-client';

import { smallScreenQuery } from '../../../primitives';

import * as Styled from './styles';

import { WorkspaceMenu } from '../WorkspaceMenu/WorkspaceMenu';
import { WorkspaceSelector } from '../WorkspaceSelector/WorkspaceSelector';

import { Drawer } from 'vaul';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { useLocalStorage } from '@decipad/react-utils';
import { WorkspaceNavigation } from '../WorkspaceNavigation/WorkspaceNavigation';
import { WorkspaceAccount } from '../WorkspaceAccount/WorkspaceAccount';
import { useLocation } from 'react-router-dom';
import { SidebarOpen } from 'libs/ui/src/icons';
import { SectionRecord, WorkspaceMeta } from 'libs/ui/src/types/workspaces';

type DashboardSidebarProps = {
  readonly name: string | undefined;
  readonly email: string | undefined;
  readonly workspaces: WorkspaceMeta[];
  readonly onCreateWorkspace: () => void;
  readonly onNavigateWorkspace: (id: string) => void;
  readonly onDeleteSection: (sectionId: string) => void;
  readonly onCreateSection: (
    record: SectionRecord
  ) => Promise<void | CreateSectionMutation | undefined>;
  readonly onUpdateSection: (
    record: SectionRecord & { sectionId: string }
  ) => Promise<any>;
  readonly onShowFeedback: () => void;
  readonly onLogout: () => void;
};

export const DashboardSidebar = ({
  ...props
}: DashboardSidebarProps): ReturnType<FC> => {
  const { workspaces, onNavigateWorkspace, onCreateWorkspace } = props;

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.isSelected) ?? workspaces[0],
    [workspaces]
  );

  const permission = useWorkspacePermission(activeWorkspace.id);

  const showAdminSettings = permission === 'ADMIN';

  const SELECTED_WORKSPACE_KEY = 'selectedWorkspace';

  const isMobile = useMediaQuery(smallScreenQuery);

  const [, setSelectedWorkspace] = useLocalStorage(SELECTED_WORKSPACE_KEY, '');

  const [openDrawer, setOpenDrawer] = useState(false);

  const handleSelectWorkspace = useCallback(
    (id: string) => {
      setSelectedWorkspace(id);
      onNavigateWorkspace(id);
    },
    [setSelectedWorkspace, onNavigateWorkspace]
  );

  const location = useLocation();

  // close the drawer when the location changes
  useEffect(() => {
    setOpenDrawer(false);
  }, [location]);

  const withCloseDrawer = <T extends any[]>(fn: (...args: T) => void) => {
    return (...args: T) => {
      fn(...args);

      setOpenDrawer(false);
    };
  };

  if (isMobile) {
    return (
      <Drawer.Root
        shouldScaleBackground
        direction="left"
        open={openDrawer}
        onOpenChange={setOpenDrawer}
      >
        <Drawer.Trigger asChild>
          <Styled.ToggleButton>
            <SidebarOpen />
          </Styled.ToggleButton>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Content
            css={{
              position: 'fixed',
              left: 0,
              right: 48,
              bottom: 0,
              top: 0,
            }}
          >
            <Styled.DrawerContainer>
              <Styled.SidebarWrapper>
                <WorkspaceMenu
                  workspaces={workspaces}
                  onCreateWorkspace={withCloseDrawer(onCreateWorkspace)}
                  onSelectWorkspace={withCloseDrawer(handleSelectWorkspace)}
                />

                <Styled.Separator />
                <WorkspaceNavigation
                  {...props}
                  activeWorkspace={activeWorkspace}
                  showAdminSettings={showAdminSettings}
                />
                <Styled.Separator />
                <WorkspaceAccount />
              </Styled.SidebarWrapper>
            </Styled.DrawerContainer>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Styled.SidebarWrapper>
      <WorkspaceSelector
        name={activeWorkspace.name}
        membersCount={activeWorkspace.membersCount ?? 1}
        isPremium={!!activeWorkspace.isPremium}
        plan={activeWorkspace.plan?.title}
        MenuComponent={
          <WorkspaceMenu
            workspaces={workspaces}
            onCreateWorkspace={onCreateWorkspace}
            onSelectWorkspace={handleSelectWorkspace}
          />
        }
      />
      <Styled.Separator />
      <WorkspaceNavigation
        {...props}
        activeWorkspace={activeWorkspace}
        showAdminSettings={showAdminSettings}
      />
      <Styled.Separator />
      <WorkspaceAccount />
    </Styled.SidebarWrapper>
  );
};
