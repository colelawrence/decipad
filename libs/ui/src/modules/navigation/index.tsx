/* eslint-disable decipad/css-prop-named-variable */
import { FC, useContext, useState } from 'react';
import { notebooks as notebooksRouting } from '@decipad/routing';
import { ClientEventsContext } from '@decipad/client-events';
import {
  PermissionType,
  useCreateNotebookMutation,
} from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';
import { initNewDocument } from '@decipad/docsync';
import {
  Folder,
  Sheet,
  Add,
  Ellipsis,
  CaretDown,
  CaretRight,
  FolderOpen,
  MagnifyingGlass,
} from '../../icons';
import { hexToOpaqueColor } from '../../primitives';
import {
  Divider,
  SearchFieldWithDropdown,
  Spinner,
  Tooltip,
} from '../../shared';
import { Anchor, colorSwatches, DNDItemTypes } from '../../utils';
import { NavigationList } from '../workspace/NavigationList/NavigationList';
import { SectionItem } from '../workspace/SectionItem/SectionItem';
import * as Styled from './styles';
import type { NavigationSidebarProps } from './types';
import { useNavigate } from 'react-router-dom';
import { NotebookOptions } from '../topbar';

export const minWidthForItemStyles = { minWidth: '132px' };

export const NavigationSidebar: FC<NavigationSidebarProps> = ({
  sections,
  numberCatalog,
  notebooks,
  workspaceId,
  notebookId,
  workspaces,
  actions,
  onDuplicate,
  toggleAddNewVariable,
  search,
  setSearch,
}) => {
  const sectionFromCurrentNotebook = notebooks?.find(
    (nb) => nb.id === notebookId
  )?.sectionId;
  const [sectionHovered, setSectionHovered] = useState<string | undefined>(
    undefined
  );
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(true);
  const [isNotebookDataExpanded, setIsNotebookDataExpanded] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(
    sectionFromCurrentNotebook ?? undefined
  );
  const toast = useToast();
  const navigate = useNavigate();
  const event = useContext(ClientEventsContext);

  const createNotebook = useCreateNotebookMutation()[1];
  const handleCreateNotebook = async () => {
    if (isCreatingNotebook) {
      return;
    }

    setIsCreatingNotebook(true);
    const args = {
      workspaceId: workspaceId ?? '',
      sectionId: selectedSection,
      name: 'Welcome to Decipad!',
    };

    const createdNotebookResult = await createNotebook(args);
    const { data, error } = createdNotebookResult;

    if (error) {
      toast('Failed to create new notebook', 'error');
      setIsCreatingNotebook(false);
      return;
    }

    try {
      const initResult = await initNewDocument(data?.createPad.id ?? '');

      navigate(
        notebooksRouting({}).notebook({
          notebook: initResult,
          tab: initResult.tabId,
        }).$
      );
    } catch (e) {
      console.error(e);
      toast('Failed to create new notebook', 'error');
    } finally {
      setIsCreatingNotebook(false);
    }
  };

  const handleCreateVariable = () => {
    toggleAddNewVariable();
    event({
      segmentEvent: {
        type: 'action',
        action: 'Data Drawer Opened',
        props: {
          analytics_source: 'frontend',
          drawer_trigger: 'sidebar',
        },
      },
    });
  };

  const noSectionNotebooks =
    notebooks?.filter(
      (notebook) => !notebook.sectionId && !notebook.archived
    ) ?? [];

  const tooltipTriggerNotebook = (
    <Styled.AddButtonWrapper>
      <Styled.IconOuterWrapper highlightBackgroundOnHover={true}>
        <Styled.IconWrapper role="button" onClick={handleCreateNotebook}>
          {isCreatingNotebook ? <Spinner /> : <Add />}
        </Styled.IconWrapper>
      </Styled.IconOuterWrapper>
    </Styled.AddButtonWrapper>
  );

  const tooltipTriggerVariable = (
    <Styled.AddButtonWrapper>
      <Styled.IconOuterWrapper highlightBackgroundOnHover={true}>
        <Styled.IconWrapper role="button" onClick={handleCreateVariable}>
          <Add />
        </Styled.IconWrapper>
      </Styled.IconOuterWrapper>
    </Styled.AddButtonWrapper>
  );

  return (
    <Styled.NavigationSidebarWrapperStyles data-testid="editor-navigation-bar">
      <div css={{ padding: '10px 0' }}>
        <Divider />
      </div>
      <Styled.NavigationTitleWrapper>
        <Styled.NavigationTitleInnerWrapper
          onClick={() => setIsNavigationExpanded(!isNavigationExpanded)}
        >
          <Styled.IconOuterWrapper>
            <Styled.IconWrapper>
              {isNavigationExpanded && <CaretDown />}
              {!isNavigationExpanded && <CaretRight />}
            </Styled.IconWrapper>
          </Styled.IconOuterWrapper>
          <Styled.NavigationTitle>Navigation</Styled.NavigationTitle>
        </Styled.NavigationTitleInnerWrapper>
        <Tooltip side="top" hoverOnly trigger={tooltipTriggerNotebook}>
          <Styled.TooltipText>New Notebook</Styled.TooltipText>
        </Tooltip>
      </Styled.NavigationTitleWrapper>
      {isNavigationExpanded && (
        <NavigationList>
          {[
            sections.map((section) => {
              const notebooksPerSection =
                notebooks?.filter(
                  (notebook) =>
                    notebook.sectionId === section.id && !notebook.archived
                ) || [];
              return (
                <SectionItem
                  ident={0}
                  dndInfo={{
                    target: DNDItemTypes.ICON,
                    id: section.id,
                  }}
                  hasChildren={true}
                  isActive={false}
                  color={
                    hexToOpaqueColor(section.color) ||
                    colorSwatches.Catskill.base
                  }
                  key={`section-item-${section.id}`}
                  MenuComponent={undefined}
                >
                  <Styled.ItemWrapper
                    onMouseEnter={() => setSectionHovered(section.id)}
                    onMouseLeave={() => setSectionHovered(undefined)}
                    isSelected={section.id === sectionHovered}
                    onClick={() => {
                      setSelectedSection(
                        section.id !== selectedSection ? section.id : undefined
                      );
                    }}
                    role="button"
                  >
                    <Styled.IconWrapper color={section.color}>
                      {section.id !== selectedSection &&
                        section.id !== sectionHovered && <Folder />}
                      {(section.id === selectedSection ||
                        section.id === sectionHovered) && <FolderOpen />}
                    </Styled.IconWrapper>
                    <Styled.TextWrapper>{section.name}</Styled.TextWrapper>
                  </Styled.ItemWrapper>
                  {section.id === selectedSection && [
                    notebooksPerSection.map((notebook) => {
                      const { id, name } = notebook;
                      const href = notebooksRouting({}).notebook({
                        notebook: { id, name },
                      }).$;

                      return (
                        <Styled.NotebookWrapper
                          isSelected={notebook.id === notebookId}
                          key={`notebook-item-${notebook.id}`}
                        >
                          <Anchor href={href}>
                            <Styled.ItemWrapper marginLeft={22}>
                              <Styled.IconWrapper>
                                <Sheet />
                              </Styled.IconWrapper>
                              <Styled.TextWrapper
                                isSelected={notebook.id === notebookId}
                                isNested={true}
                              >
                                {notebook.name}
                              </Styled.TextWrapper>
                            </Styled.ItemWrapper>
                          </Anchor>
                          <Styled.NotebookOptionsWrapper>
                            {notebook.id === notebookId && (
                              <NotebookOptions
                                permissionType={
                                  notebook.myPermissionType as PermissionType
                                }
                                onDuplicate={onDuplicate}
                                trigger={
                                  <Styled.EllipsisWrapper data-testid="list-notebook-options">
                                    <Ellipsis />
                                  </Styled.EllipsisWrapper>
                                }
                                workspaces={workspaces}
                                notebookId={id}
                                creationDate={new Date(notebook.createdAt)}
                                isArchived={!!notebook.archived}
                                actions={actions}
                                sections={sections}
                                workspaceId={workspaceId ?? ''}
                                popupAlign="start"
                                popupSide="right"
                              />
                            )}
                          </Styled.NotebookOptionsWrapper>
                        </Styled.NotebookWrapper>
                      );
                    }),
                  ]}
                </SectionItem>
              );
            }),
          ]}
          <Styled.UnsectionedNotebooksWrapper>
            {[
              noSectionNotebooks.map((notebook) => {
                const { id, name } = notebook;
                const href = notebooksRouting({}).notebook({
                  notebook: { id, name },
                }).$;
                return (
                  <Styled.NotebookWrapper key={`notebook-item-${notebook.id}`}>
                    <Anchor href={href}>
                      <Styled.ItemWrapper>
                        <Styled.IconWrapper>
                          <Sheet />
                        </Styled.IconWrapper>
                        <Styled.TextWrapper>{notebook.name}</Styled.TextWrapper>
                      </Styled.ItemWrapper>
                    </Anchor>
                    <Styled.NotebookOptionsWrapper>
                      {notebook.id === notebookId && (
                        <NotebookOptions
                          permissionType={
                            notebook.myPermissionType as PermissionType
                          }
                          onDuplicate={onDuplicate}
                          trigger={
                            <Styled.EllipsisWrapper data-testid="list-notebook-options">
                              <Ellipsis />
                            </Styled.EllipsisWrapper>
                          }
                          workspaces={workspaces}
                          notebookId={id}
                          creationDate={new Date(notebook.createdAt)}
                          isArchived={!!notebook.archived}
                          actions={actions}
                          workspaceId={workspaceId ?? ''}
                        />
                      )}
                    </Styled.NotebookOptionsWrapper>
                  </Styled.NotebookWrapper>
                );
              }),
            ]}
          </Styled.UnsectionedNotebooksWrapper>
        </NavigationList>
      )}
      <div css={{ padding: '12px 0' }}>
        <Divider />
      </div>
      <div css={{ marginBottom: '8px' }}>
        <SearchFieldWithDropdown
          searchTerm={search}
          onSearchChange={(newValue) => {
            setSearch(newValue.toLocaleLowerCase());
          }}
          placeholder="Search"
          icon={<MagnifyingGlass />}
          hasGreyBackGround={true}
        />
      </div>
      <Styled.NavigationTitleWrapper>
        <Styled.NavigationTitleInnerWrapper
          onClick={() => setIsNotebookDataExpanded(!isNotebookDataExpanded)}
        >
          <Styled.IconOuterWrapper>
            <Styled.IconWrapper>
              {isNotebookDataExpanded && <CaretDown />}
              {!isNotebookDataExpanded && <CaretRight />}
            </Styled.IconWrapper>
          </Styled.IconOuterWrapper>
          <Styled.NavigationTitle>Notebook Data</Styled.NavigationTitle>
        </Styled.NavigationTitleInnerWrapper>
        <Tooltip side="top" hoverOnly trigger={tooltipTriggerVariable}>
          <Styled.TooltipText>New Variable</Styled.TooltipText>
        </Tooltip>
      </Styled.NavigationTitleWrapper>
      {isNotebookDataExpanded && numberCatalog}
    </Styled.NavigationSidebarWrapperStyles>
  );
};
