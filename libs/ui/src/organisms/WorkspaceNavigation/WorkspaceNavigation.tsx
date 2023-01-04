import { isFlagEnabled } from '@decipad/feature-flags';
import { useActiveElement } from '@decipad/react-utils';
import { docs, workspaces } from '@decipad/routing';

import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Divider, Dot, MenuItem, NavigationItem, Tooltip } from '../../atoms';
import { Archive, Chat, Docs, Home, Plus, Sparkles } from '../../icons';
import { NavigationList } from '../../molecules';
import {
  cssVar,
  hexToOpaqueColor,
  OpaqueColor,
  opaqueColorToHex,
} from '../../primitives';
import { CreateOrEditSectionModal } from '../../templates';
import {
  AvailableSwatchColor,
  colorSwatches,
  DNDItemTypes,
  hexBaseSwatches,
  swatchNames,
} from '../../utils';

const workspaceNavContainerStyles = (flagEnabled: boolean) =>
  css({
    display: 'grid',
    gridTemplateRows: `auto ${
      flagEnabled ? 'auto auto' : ''
    } auto 1fr auto auto auto`,
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
  readonly onCreateSection: (record: SectionRecord) => Promise<any>;
  readonly onUpdateSection: (
    record: SectionRecord & { sectionId: string }
  ) => Promise<any>;
  readonly activeWorkspace: {
    id: string;
    sections: Section[];
  };
}
export const WorkspaceNavigation = ({
  activeWorkspace,
  onDeleteSection,
  onCreateSection,
  onUpdateSection,
}: WorkspaceNavigationProps): ReturnType<FC> => {
  const activeWorkspaceRoute = workspaces({}).workspace({
    workspaceId: activeWorkspace.id,
  });
  const { sections } = activeWorkspace;

  const navigate = useNavigate();
  const { '*': maybeWorkspaceFolder } = useParams();
  const isArchivePage = maybeWorkspaceFolder === 'archived';

  const sectionsEnabled = !isArchivePage && isFlagEnabled('COLOR_SIDEBAR');

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

  return (
    <nav css={workspaceNavContainerStyles(sectionsEnabled)}>
      <NavigationList key={'workspace-nav-0'}>
        <NavigationItem
          key={'folder-0'}
          href={activeWorkspaceRoute.$}
          isActive={!isArchivePage}
          icon={<Home />}
        >
          <span css={itemTextStyles}>My Notebooks</span>
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
              <Tooltip
                side="right"
                variant="small"
                trigger={
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
                        <span css={itemTextStyles}>New Section</span>
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
                              if (res.data) {
                                if (res.data.addSectionToWorkspace?.id) {
                                  navigate(
                                    activeWorkspaceRoute.section({
                                      sectionId:
                                        res.data.addSectionToWorkspace.id,
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
                }
              >
                Create a new section
              </Tooltip>
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

      <div key="div-empty-grid-spaces" role="presentation" />
      <NavigationList key={'navigation-footer-0'}>
        <NavigationItem
          href={docs({}).page({ name: 'gallery' }).$}
          key={'navfoot-docs-0'}
          icon={<Sparkles />}
        >
          <span css={itemTextStyles}>Templates</span>
        </NavigationItem>
      </NavigationList>
      <div key="div-1" role="presentation" css={hrStyles}>
        <Divider />
      </div>
      <NavigationList key={'settings-0'}>
        <NavigationItem
          href={docs({}).$}
          key={'navfoot-docs-0'}
          icon={<Docs />}
        >
          <span css={itemTextStyles}>Documentation</span>
        </NavigationItem>
        <NavigationItem
          href="https://feedback.decipad.com"
          key={'navfoot-feedback-1'}
          icon={<Chat />}
        >
          <span css={itemTextStyles}>Feedback</span>
        </NavigationItem>
      </NavigationList>
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
