/* eslint-disable decipad/css-prop-named-variable */
import { FC, useContext, useState } from 'react';
import { notebooks as notebooksRouting } from '@decipad/routing';
import { ClientEventsContext } from '@decipad/client-events';
import { useCreateNotebookMutation } from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';
import { initNewDocument } from '@decipad/docsync';
import {
  Folder,
  Add,
  CaretDown,
  CaretRight,
  FolderOpen,
  MagnifyingGlass,
} from '../../icons';
import { cssVar, hexToOpaqueColor } from '../../primitives';
import { SearchFieldWithDropdown, Spinner, Tooltip } from '../../shared';
import { colorSwatches, DNDItemTypes } from '../../utils';
import { NavigationList } from '../workspace/NavigationList/NavigationList';
import { SectionItem } from '../workspace/SectionItem/SectionItem';
import * as Styled from './styles';
import type { NavigationSidebarProps } from './types';
import { useNavigate } from 'react-router-dom';
import { NotebookNavigation } from './NotebookNavigation';
import styled from '@emotion/styled';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  PanelGroupProps,
} from 'react-resizable-panels';

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

  const StyledSplitPane = styled(PanelGroup)<PanelGroupProps>({
    // Panel component sets a height: 100% internally...
    height: 'calc(100% - 80px) !important',
  });

  const SectionWrapper = styled(Panel)(deciOverflowYStyles, {
    width: '100%',
    // Panel component sets an overflow: hidden internally...
    overflow: 'auto !important',
  });

  const ResizableDivider = styled(PanelResizeHandle)({
    backgroundColor: cssVar('backgroundHeavy'),
    height: '1px',
    margin: '8px 0 8px 12px',
    ':hover': {
      height: '3px',
      margin: '7px 0 7px 12px',
    },
  });

  return (
    <Styled.NavigationSidebarWrapperStyles>
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
      <StyledSplitPane direction="vertical" autoSaveId="leftSideBar">
        <SectionWrapper minSize={20}>
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
            <Styled.ListWrapper>
              <NavigationList>
                {sections.map((section) => {
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
                            section.id !== selectedSection
                              ? section.id
                              : undefined
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
                            <NotebookNavigation
                              key={notebook.id}
                              href={href}
                              notebook={notebook}
                              currentNotebookId={notebookId}
                              actions={actions}
                              sections={sections}
                              workspaces={workspaces}
                              workspaceId={workspaceId}
                              onDuplicate={onDuplicate}
                            />
                          );
                        }),
                      ]}
                    </SectionItem>
                  );
                })}
                {noSectionNotebooks.map((notebook) => {
                  const { id, name } = notebook;
                  const href = notebooksRouting({}).notebook({
                    notebook: { id, name },
                  }).$;
                  return (
                    <NotebookNavigation
                      key={notebook.id}
                      href={href}
                      onDuplicate={onDuplicate}
                      notebook={notebook}
                      workspaces={workspaces}
                      workspaceId={workspaceId}
                      currentNotebookId={notebookId}
                      actions={actions}
                    />
                  );
                })}
              </NavigationList>
            </Styled.ListWrapper>
          )}
        </SectionWrapper>
        <ResizableDivider />
        <SectionWrapper minSize={20}>
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
          <Styled.ListWrapper>
            {isNotebookDataExpanded && numberCatalog}
          </Styled.ListWrapper>
        </SectionWrapper>
      </StyledSplitPane>
    </Styled.NavigationSidebarWrapperStyles>
  );
};
