/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useActiveElement } from '@decipad/react-utils';
import { docs, workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { FC, useContext, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CreateSectionMutation } from '@decipad/graphql-client';
import {
  Divider,
  Dot,
  ExternalHrefIcon,
  MenuItem,
  NavigationItem,
} from '../../atoms';
import {
  Archive,
  Chat,
  Docs,
  Gear,
  Home,
  Key,
  Plus,
  Sparkles,
  Users,
} from '../../icons';
import { NavigationList } from '../../molecules';
import {
  OpaqueColor,
  cssVar,
  hexToOpaqueColor,
  opaqueColorToHex,
  smallScreenQuery,
} from '../../primitives';
import { CreateOrEditSectionModal } from '../../templates';
import {
  AvailableSwatchColor,
  DNDItemTypes,
  colorSwatches,
  hexBaseSwatches,
  swatchNames,
} from '../../utils';
import { WorkspaceAccount } from '../WorkspaceAccount/WorkspaceAccount';

const workspaceNavContainerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

const itemTextStyles = css({ padding: '8px 0' });
const hrStyles = css({
  padding: '12px 0',
  textOverflow: 'ellipsis',
  transform: 'translateX(-15px)',
  width: 'calc(100% + 30px)',
  hr: {
    boxShadow: `0 0 0 0.5px ${cssVar('borderColor')}`,
  },
});

export interface Section {
  id: string;
  color: string;
  name: string;
}

interface SectionRecord {
  name: string;
  color: string;
  workspaceId: string;
}

interface WorkspaceNavigationProps {
  readonly onDeleteSection: (sectionId: string) => void;
  readonly onCreateSection: (
    record: SectionRecord
  ) => Promise<void | CreateSectionMutation | undefined>;
  readonly onUpdateSection: (
    record: SectionRecord & { sectionId: string }
  ) => Promise<any>;
  readonly activeWorkspace: {
    id: string;
    sections: Section[];
  };
  readonly showFeedback?: () => void;
  readonly enableAccountFooter?: boolean;
  readonly enableSettingsAndMembers?: boolean;
}

const NavSpacer = () => (
  <div
    css={{
      flex: 1,
      [smallScreenQuery]: {
        flex: 0,
        minHeight: '24px',
      },
    }}
  />
);
const NavDivider = () => (
  <div role="presentation" css={hrStyles}>
    <Divider />
  </div>
);

export const WorkspaceNavigation = ({
  activeWorkspace,
  onDeleteSection,
  onCreateSection,
  onUpdateSection,
  enableAccountFooter = false,
  enableSettingsAndMembers = false,
  showFeedback,
}: WorkspaceNavigationProps): ReturnType<FC> => {
  const activeWorkspaceRoute = workspaces({}).workspace({
    workspaceId: activeWorkspace.id,
  });

  const { sections } = activeWorkspace;

  const navigate = useNavigate();
  const { '*': maybeWorkspaceFolder } = useParams();
  const isArchivePage = maybeWorkspaceFolder === 'archived';
  const isSharedPage = maybeWorkspaceFolder === 'shared';

  const isHomePage = !isArchivePage && !isSharedPage;

  const sectionsEnabled = !isArchivePage;

  const [sectionStore, setSectionStore] = useState({
    name: 'My Section',
    color: 'Malibu' as AvailableSwatchColor,
    id: '',
  } as Section);

  const [openMenu, setOpenMenu] = useState(false);
  const [openRenameMenu, setOpenRenameMenu] = useState(false);
  const ref = useActiveElement(() => {
    setOpenMenu(false);
  });

  const location = useLocation();
  const clientEvent = useContext(ClientEventsContext);

  const isSharedSectionEnabled = isFlagEnabled('SHARE_PAD_WITH_EMAIL');

  return (
    <nav css={workspaceNavContainerStyles}>
      {/* TODO: cleanup NO_WORKSPACE_SWITCHER flag */}
      {enableSettingsAndMembers && (
        <>
          <NavigationList key={'workspace-nav-SM'}>
            <NavigationItem
              key={'folder-0'}
              href={activeWorkspaceRoute.members({}).$}
              isActive={isSharedPage}
              icon={<Users />}
            >
              <span css={itemTextStyles}>Manage members</span>
            </NavigationItem>
          </NavigationList>

          <NavigationList key={'workspace-nav-ST'}>
            <NavigationItem
              key={'folder-0'}
              href={activeWorkspaceRoute.edit({}).$}
              isActive={isSharedPage}
              icon={<Gear />}
            >
              <span css={itemTextStyles}>Workspace settings</span>
            </NavigationItem>
          </NavigationList>

          <NavigationList key={'workspace-nav-DC'}>
            <NavigationItem
              key={'folder-0'}
              href={activeWorkspaceRoute.connections({}).$}
              isActive={isSharedPage}
              icon={<Key />}
            >
              <span css={itemTextStyles}>Data connections</span>
            </NavigationItem>
          </NavigationList>

          <NavDivider />
        </>
      )}

      <NavigationList key={'workspace-nav-0'}>
        <NavigationItem
          key={'folder-0'}
          href={activeWorkspaceRoute.$}
          isActive={isHomePage}
          icon={<Home />}
        >
          <span css={itemTextStyles} data-testid="my-notebooks-button">
            My Notebooks
          </span>
        </NavigationItem>
      </NavigationList>
      {sectionsEnabled
        ? [
            <NavigationList
              wrapperStyles={
                // see why below
                css([
                  { paddingTop: 6 },
                  sections.length > 5 && {
                    overflow: 'hidden',
                    overflowY: 'auto',
                    height: '185px', // about five items
                  },
                ])
              }
              key={'sections-list'}
            >
              {sections.map((section) => {
                const selected =
                  location.pathname ===
                  activeWorkspaceRoute.section({
                    sectionId: section.id,
                  }).$;
                return (
                  <NavigationItem
                    key={`section-${section.id}`}
                    dndInfo={{ target: DNDItemTypes.ICON, id: section.id }}
                    href={
                      selected
                        ? activeWorkspaceRoute.$
                        : activeWorkspaceRoute.section({
                            sectionId: section.id,
                          }).$
                    }
                    iconStyles={css({ width: 12, height: 12 })}
                    wrapperStyles={css({
                      'div[aria-label="lefty"]': { paddingLeft: 16 },
                    })}
                    isActive={selected}
                    icon={
                      selected ? (
                        <Dot
                          color={
                            hexToOpaqueColor(section.color) ||
                            colorSwatches.Catskill.base
                          }
                          size={12}
                          variant
                          square
                          drunkMode
                        />
                      ) : (
                        <Dot
                          color={
                            hexToOpaqueColor(section.color) ||
                            colorSwatches.Catskill.base
                          }
                          size={12}
                          variant
                          square
                        />
                      )
                    }
                    backgroundColor={
                      hexToOpaqueColor(section.color) ||
                      colorSwatches.Catskill.base
                    }
                    menuItems={[
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
                      </MenuItem>,
                      <MenuItem
                        key={`menu-item-delete-${section.id}`}
                        onSelect={() => onDeleteSection(section.id)}
                      >
                        <div css={{ minWidth: '132px' }}>Delete</div>
                      </MenuItem>,
                    ]}
                  >
                    <span css={itemTextStyles}>{section.name}</span>
                  </NavigationItem>
                );
              })}
            </NavigationList>,
            <div role="presentation" key="sections-part-0">
              <span ref={ref}>
                <NavigationList key={'sections-new'}>
                  <NavigationItem
                    key={'section-new'}
                    wrapperStyles={css({
                      'div[aria-label="lefty"]': { paddingLeft: 16 },
                      'button div': {
                        color: cssVar('weakerTextColor'),
                      },
                      'button div span svg path': {
                        stroke: cssVar('weakerTextColor'),
                      },
                    })}
                    iconStyles={css({ width: 12, height: 12 })}
                    onClick={() => setOpenMenu(!openMenu)}
                    icon={<Plus />}
                  >
                    <span css={itemTextStyles} data-testid="new-section-button">
                      New Section
                    </span>
                  </NavigationItem>
                </NavigationList>

                {openMenu && (
                  <CreateOrEditSectionModal
                    onClose={() => setOpenMenu(!openMenu)}
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
                            console.error('Failed to create section.', res);
                          }
                        })
                        .catch((err) => {
                          console.error(
                            'Failed to create section. Error:',
                            err
                          );
                        });
                    }}
                  />
                )}
              </span>
            </div>,
          ]
        : null}

      <NavigationList key={'workspace-nav-01'}>
        <NavigationItem
          key={'archive-3'}
          icon={<Archive />}
          href={activeWorkspaceRoute.archived({}).$}
          isActive={isArchivePage}
        >
          <span css={itemTextStyles}>Archived</span>
        </NavigationItem>
      </NavigationList>

      <NavSpacer />

      <NavDivider />

      {isSharedSectionEnabled && (
        <NavigationList key={'workspace-nav-S'}>
          <NavigationItem
            key={'folder-0'}
            href={activeWorkspaceRoute.shared({}).$}
            isActive={isSharedPage}
            icon={<Users />}
          >
            <span css={itemTextStyles}>Shared with me</span>
          </NavigationItem>
        </NavigationList>
      )}

      <div key="div-empty-grid-spaces" role="presentation" />
      <NavigationList key={'navigation-footer-0'}>
        <NavigationItem
          href={docs({}).page({ name: 'gallery' }).$}
          key={'navfoot-docs-0'}
          icon={<Sparkles />}
        >
          <span css={itemTextStyles}>
            Templates <ExternalHrefIcon />
          </span>
        </NavigationItem>
      </NavigationList>

      <NavDivider />

      <NavigationList key={'settings-0'}>
        <NavigationItem
          href={docs({}).$}
          key={'navfoot-docs-0'}
          icon={<Docs />}
        >
          <span css={itemTextStyles}>
            Docs & Examples <ExternalHrefIcon />
          </span>
        </NavigationItem>
        <NavigationItem
          key={'navfoot-feedback-1'}
          icon={<Chat />}
          onClick={() => {
            clientEvent({
              type: 'action',
              action: 'send feedback',
            });
            showFeedback?.();
          }}
        >
          <span css={itemTextStyles}>Feedback</span>
        </NavigationItem>
      </NavigationList>

      {/* TODO: cleanup NO_WORKSPACE_SWITCHER flag */}
      {enableAccountFooter && (
        <>
          <NavDivider />
          <WorkspaceAccount />
        </>
      )}

      {openRenameMenu && (
        <div key="div-section-modal" role="presentation">
          <CreateOrEditSectionModal
            onClose={() => setOpenRenameMenu(!openRenameMenu)}
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
                    console.error('Failed to rename section.', res);
                  }
                })
                .catch((err) => {
                  console.error('Failed to rename section. Error:', err);
                });
            }}
          />
        </div>
      )}
    </nav>
  );
};
