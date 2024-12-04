/* eslint decipad/css-prop-named-variable: 0 */
import {
  CreateSectionMutation,
  ShallowWorkspaceFragment,
} from '@decipad/graphql-client';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { smallScreenQuery } from '../../../primitives';

import * as Styled from './styles';

import { WorkspaceMenu } from '../WorkspaceMenu/WorkspaceMenu';
import { WorkspaceSelector } from '../WorkspaceSelector/WorkspaceSelector';

import {
  getStripePlanTitle,
  useLocalStorage,
  useStripePlans,
} from '@decipad/react-utils';
import { workspaces as workspaceRouting } from '@decipad/routing';
import { SidebarLeft } from 'libs/ui/src/icons';
import { SectionRecord } from 'libs/ui/src/types/workspaces';
import { useLocation } from 'react-router-dom';
import { useRouteParams } from 'typesafe-routes/react-router';
import { Drawer } from 'vaul';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { WorkspaceAccount } from '../WorkspaceAccount/WorkspaceAccount';
import { WorkspaceNavigation } from '../WorkspaceNavigation/WorkspaceNavigation';

type DashboardSidebarProps = {
  readonly name: string | undefined;
  readonly email: string | undefined;
  readonly workspaces: Array<ShallowWorkspaceFragment>;
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

const getPlanTitle =
  (stripePlans: ReturnType<typeof useStripePlans>) =>
  (workspace: ShallowWorkspaceFragment): string => {
    return getStripePlanTitle(stripePlans, workspace.plan, workspace.isPremium);
  };

export const DashboardSidebar = ({
  ...props
}: DashboardSidebarProps): ReturnType<FC> => {
  const { workspaces, onNavigateWorkspace, onCreateWorkspace } = props;

  const { workspaceId } = useRouteParams(workspaceRouting({}).workspace);

  const plans = useStripePlans();
  const getPlanCurried = useMemo(() => getPlanTitle(plans), [plans]);

  const [activeWorkspace, planTitle] = useMemo((): [
    ShallowWorkspaceFragment,
    string
  ] => {
    const ws =
      workspaces.find((workspace) => workspace.id === workspaceId) ??
      workspaces[0];

    return [ws, getPlanCurried(ws)];
  }, [workspaces, getPlanCurried, workspaceId]);

  const showAdminSettings = activeWorkspace.myPermissionType === 'ADMIN';
  const showArchive = activeWorkspace.myPermissionType !== 'READ';

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
            <SidebarLeft />
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
                  getPlanTitle={getPlanCurried}
                />

                <Styled.Separator />
                <WorkspaceNavigation
                  {...props}
                  activeWorkspace={activeWorkspace}
                  showAdminSettings={showAdminSettings}
                  showArchive={showArchive}
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
        plan={planTitle}
        MenuComponent={
          <WorkspaceMenu
            workspaces={workspaces}
            onCreateWorkspace={onCreateWorkspace}
            onSelectWorkspace={handleSelectWorkspace}
            getPlanTitle={getPlanCurried}
          />
        }
      />
      <Styled.Separator />
      <WorkspaceNavigation
        {...props}
        activeWorkspace={activeWorkspace}
        showAdminSettings={showAdminSettings}
        showArchive={showArchive}
      />
      <Styled.Separator />
      <WorkspaceAccount />
    </Styled.SidebarWrapper>
  );
};
