/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { CreateSectionMutation } from '@decipad/graphql-client';
import { useStripeLinks } from '@decipad/react-utils';
import { docs, workspaces } from '@decipad/routing';
import { FC, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuItem, MenuList } from '../../../shared';
import {
  Archive,
  Chat,
  Docs,
  DollarCircle,
  Gear,
  Home,
  Key,
  Plus,
  Sparkles,
  Users,
  DeciBoxes,
  Ellipsis,
  Folder,
  ArrowDiagonalTopRight,
} from '../../../icons';

import { hexToOpaqueColor, opaqueColorToHex } from '../../../primitives';
import { OpaqueColor } from '@decipad/utils';
import { CreateOrEditSectionModal } from '../CreateOrEditSectionModal/CreateOrEditSectionModal';
import {
  AvailableSwatchColor,
  DNDItemTypes,
  colorSwatches,
  hexBaseSwatches,
  swatchNames,
} from '../../../utils';

import { SectionItem } from '../SectionItem/SectionItem';
import * as Styled from './styles';
import { NavigationList } from '../NavigationList/NavigationList';
import { NavigationItem } from '../NavigationItem/NavigationItem';
import { Section, SectionRecord, WorkspaceMeta } from 'libs/ui/src/types';

interface WorkspaceNavigationProps {
  readonly activeWorkspace: WorkspaceMeta;
  readonly showAdminSettings: boolean;
  readonly onDeleteSection: (sectionId: string) => void;
  readonly onCreateSection: (
    record: SectionRecord
  ) => Promise<void | CreateSectionMutation | undefined>;
  readonly onUpdateSection: (
    record: SectionRecord & { sectionId: string }
  ) => Promise<any>;
  readonly onShowFeedback: () => void;
}
export const WorkspaceNavigation = ({
  activeWorkspace,
  onDeleteSection,
  onCreateSection,
  onUpdateSection,
  showAdminSettings = false,
  onShowFeedback,
}: WorkspaceNavigationProps): ReturnType<FC> => {
  const activeWorkspaceRoute = workspaces({}).workspace({
    workspaceId: activeWorkspace.id,
  });

  const { sections } = activeWorkspace;

  const navigate = useNavigate();

  const [sectionStore, setSectionStore] = useState({
    name: 'My Section',
    color: 'Malibu' as AvailableSwatchColor,
    id: '',
  } as Section);

  const [openMenu, setOpenMenu] = useState(false);
  const [openRenameMenu, setOpenRenameMenu] = useState(false);

  const location = useLocation();
  const clientEvent = useContext(ClientEventsContext);

  const { customerPortalLink } = useStripeLinks(activeWorkspace);

  return (
    <Styled.Container>
      <NavigationList>
        {!activeWorkspace.isPremium && (
          <NavigationItem
            href={activeWorkspaceRoute.upgrade({}).$}
            key="workspace-upgrade-pro"
          >
            <Styled.ItemWrapper data-testid="workspace_upgrade_pro">
              <Styled.IconWrapper>
                <DeciBoxes />
              </Styled.IconWrapper>
              <Styled.TextWrapper>Upgrade to Pro</Styled.TextWrapper>
            </Styled.ItemWrapper>
          </NavigationItem>
        )}
        {showAdminSettings && (
          <NavigationItem
            key="settings-and-members"
            items={[
              <NavigationItem
                href={activeWorkspaceRoute.members({}).$}
                key="manage-workspace-members"
              >
                <Styled.ItemWrapper data-testid="manage-workspace-members">
                  <Styled.IconWrapper>
                    <Users />
                  </Styled.IconWrapper>
                  <Styled.TextWrapper>Manage members</Styled.TextWrapper>
                </Styled.ItemWrapper>
              </NavigationItem>,
              activeWorkspace.isPremium && customerPortalLink && (
                <NavigationItem
                  href={customerPortalLink}
                  key="billing-settings"
                >
                  <Styled.ItemWrapper data-testid="billing-settings">
                    <Styled.IconWrapper>
                      <DollarCircle />
                    </Styled.IconWrapper>
                    <Styled.TextWrapper>Billing settings</Styled.TextWrapper>
                  </Styled.ItemWrapper>
                </NavigationItem>
              ),
              <NavigationItem
                href={activeWorkspaceRoute.edit({}).$}
                key="workspace-settings"
              >
                <Styled.ItemWrapper>
                  <Styled.IconWrapper>
                    <Gear />
                  </Styled.IconWrapper>
                  <Styled.TextWrapper>Workspace settings</Styled.TextWrapper>
                </Styled.ItemWrapper>
              </NavigationItem>,
              <NavigationItem
                href={activeWorkspaceRoute.connections({}).codeSecrets({}).$}
                key="data-connections"
              >
                <Styled.ItemWrapper>
                  <Styled.IconWrapper>
                    <Key />
                  </Styled.IconWrapper>
                  <Styled.TextWrapper>Data connections</Styled.TextWrapper>
                </Styled.ItemWrapper>
              </NavigationItem>,
            ]}
          >
            <Styled.ItemWrapper data-testid="settings-and-members">
              <Styled.IconWrapper>
                <Gear />
              </Styled.IconWrapper>
              <Styled.TextWrapper>Settings and members</Styled.TextWrapper>
            </Styled.ItemWrapper>
          </NavigationItem>
        )}

        <NavigationItem
          href={activeWorkspaceRoute.$}
          key="notebooks"
          items={[
            sections.map((section) => {
              const selected =
                location.pathname ===
                activeWorkspaceRoute.section({
                  sectionId: section.id,
                }).$;
              return (
                <SectionItem
                  href={
                    activeWorkspaceRoute.section({
                      sectionId: section.id,
                    }).$
                  }
                  dndInfo={{
                    target: DNDItemTypes.ICON,
                    id: section.id,
                  }}
                  isActive={selected}
                  color={
                    hexToOpaqueColor(section.color) ||
                    colorSwatches.Catskill.base
                  }
                  key={`section-item-${section.id}`}
                  MenuComponent={
                    selected ? (
                      <MenuList
                        root
                        dropdown
                        modal={false}
                        align="start"
                        side="bottom"
                        trigger={
                          <Styled.IconWrapper as="button" color={section.color}>
                            <Ellipsis />
                          </Styled.IconWrapper>
                        }
                      >
                        <MenuItem
                          key={`menu-item-rename-${section.id}`}
                          onSelect={() => {
                            const updateStore = {
                              name: section.name,
                              id: section.id,
                              color: 'Malibu' as AvailableSwatchColor,
                            };
                            const colorName = hexBaseSwatches[section.color];
                            if (swatchNames.includes(colorName))
                              updateStore.color = colorName;
                            setSectionStore(updateStore);
                            setOpenRenameMenu(!openRenameMenu);
                          }}
                        >
                          <div css={{ minWidth: '132px' }}>Edit</div>
                        </MenuItem>
                        <MenuItem
                          key={`menu-item-delete-${section.id}`}
                          onSelect={() => onDeleteSection(section.id)}
                        >
                          <div css={{ minWidth: '132px' }}>Delete</div>
                        </MenuItem>
                      </MenuList>
                    ) : undefined
                  }
                >
                  <Styled.ItemWrapper>
                    <Styled.IconWrapper color={section.color}>
                      <Folder />
                    </Styled.IconWrapper>
                    <Styled.TextWrapper>{section.name}</Styled.TextWrapper>
                  </Styled.ItemWrapper>
                </SectionItem>
              );
            }),
            <NavigationItem
              onClick={() => setOpenMenu(!openMenu)}
              isActive={openMenu}
              key="new-folder"
            >
              <Styled.ItemWrapper data-testid="new-section-button" isButton>
                <Styled.IconWrapper>
                  <Plus />
                </Styled.IconWrapper>
                <Styled.TextWrapper>New folder</Styled.TextWrapper>
              </Styled.ItemWrapper>
            </NavigationItem>,
          ]}
        >
          <Styled.ItemWrapper data-testid="my-notebooks">
            <Styled.IconWrapper>
              <Home />
            </Styled.IconWrapper>
            <Styled.TextWrapper>My notebooks</Styled.TextWrapper>
          </Styled.ItemWrapper>
        </NavigationItem>

        <NavigationItem
          href={activeWorkspaceRoute.shared({}).$}
          key="shared-with-me"
        >
          <Styled.ItemWrapper>
            <Styled.IconWrapper>
              <Users />
            </Styled.IconWrapper>
            <Styled.TextWrapper>Shared with me</Styled.TextWrapper>
          </Styled.ItemWrapper>
        </NavigationItem>
        <NavigationItem
          href={activeWorkspaceRoute.archived({}).$}
          key="archieved"
        >
          <Styled.ItemWrapper data-testid="my-archive">
            <Styled.IconWrapper>
              <Archive />
            </Styled.IconWrapper>
            <Styled.TextWrapper>Archived</Styled.TextWrapper>
          </Styled.ItemWrapper>
        </NavigationItem>
      </NavigationList>
      <NavigationList>
        <NavigationItem
          href={'http://www.decipad.com/templates'}
          key="templates"
        >
          <Styled.ItemWrapper>
            <Styled.IconWrapper>
              <Sparkles />
            </Styled.IconWrapper>
            <Styled.TextWrapper>
              Templates <ArrowDiagonalTopRight />
            </Styled.TextWrapper>
          </Styled.ItemWrapper>
        </NavigationItem>

        <NavigationItem href={docs({}).$} key="docs-and-examples">
          <Styled.ItemWrapper>
            <Styled.IconWrapper>
              <Docs />
            </Styled.IconWrapper>
            <Styled.TextWrapper>
              Docs & Examples <ArrowDiagonalTopRight />
            </Styled.TextWrapper>
          </Styled.ItemWrapper>
        </NavigationItem>
        <NavigationItem
          key={'feedback'}
          onClick={() => {
            clientEvent({
              type: 'action',
              action: 'send feedback',
            });
            onShowFeedback();
          }}
        >
          <Styled.ItemWrapper>
            <Styled.IconWrapper>
              <Chat />
            </Styled.IconWrapper>
            <Styled.TextWrapper>Feedback</Styled.TextWrapper>
          </Styled.ItemWrapper>
        </NavigationItem>
      </NavigationList>

      <CreateOrEditSectionModal
        open={openMenu}
        onOpenChange={setOpenMenu}
        onSubmit={(sectionName: string, color: OpaqueColor) => {
          onCreateSection({
            workspaceId: activeWorkspace.id,
            name: sectionName,
            color: opaqueColorToHex(color),
          })
            .then((res) => {
              if (res) {
                if (res.addSectionToWorkspace?.id) {
                  navigate(
                    activeWorkspaceRoute.section({
                      sectionId: res.addSectionToWorkspace.id,
                    }).$
                  );
                }
              } else {
                console.error('Failed to create folder.', res);
              }
            })
            .catch((err) => {
              console.error('Failed to create folder. Error:', err);
            });
        }}
      />

      <CreateOrEditSectionModal
        open={openRenameMenu}
        onOpenChange={setOpenRenameMenu}
        op="edit"
        placeholderName={sectionStore.name}
        placeholderColor={sectionStore.color}
        onSubmit={(sectionName: string, color: OpaqueColor) => {
          onUpdateSection({
            workspaceId: activeWorkspace.id,
            name: sectionName,
            sectionId: sectionStore.id,
            color: opaqueColorToHex(color),
          })
            .then((res) => {
              if (res.data) {
                navigate(
                  activeWorkspaceRoute.section({
                    sectionId: sectionStore.id,
                  }).$
                );
              } else {
                console.error('Failed to rename folder.', res);
              }
            })
            .catch((err) => {
              console.error('Failed to rename folder. Error:', err);
            });
        }}
      />
    </Styled.Container>
  );
};
