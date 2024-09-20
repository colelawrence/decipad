/* eslint-disable decipad/css-prop-named-variable */
import { FC, useState } from 'react';
import { notebooks as notebooksRouting } from '@decipad/routing';
import {
  PermissionType,
  useCreateNotebookMutation,
} from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';
import { initNewDocument } from '@decipad/docsync';
import { Folder, Sheet, Add, Ellipsis } from '../../icons';
import { hexToOpaqueColor } from '../../primitives';
import { Divider, Spinner, Tooltip } from '../../shared';
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
}) => {
  const sectionFromCurrentNotebook = notebooks?.find(
    (nb) => nb.id === notebookId
  )?.sectionId;
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(
    sectionFromCurrentNotebook ?? undefined
  );
  const toast = useToast();
  const navigate = useNavigate();
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

  const noSectionNotebooks =
    notebooks?.filter((notebook) => !notebook.sectionId) ?? [];

  const tooltipTrigger = (
    <Styled.AddButtonWrapper>
      <Styled.IconWrapper role="button" onClick={handleCreateNotebook}>
        {isCreatingNotebook ? <Spinner /> : <Add />}
      </Styled.IconWrapper>
    </Styled.AddButtonWrapper>
  );

  return (
    <Styled.NavigationSidebarWrapperStyles data-testid="editor-navigation-bar">
      <Styled.NavigationTitleWrapper>
        <Styled.NavigationTitle>Navigation</Styled.NavigationTitle>
        <Tooltip side="top" hoverOnly trigger={tooltipTrigger}>
          <Styled.TooltipText>Add Notebook</Styled.TooltipText>
        </Tooltip>
      </Styled.NavigationTitleWrapper>
      <NavigationList>
        {[
          sections.map((section) => {
            const notebooksPerSection =
              notebooks?.filter(
                (notebook) => notebook.sectionId === section.id
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
                  hexToOpaqueColor(section.color) || colorSwatches.Catskill.base
                }
                key={`section-item-${section.id}`}
                MenuComponent={undefined}
              >
                <Styled.ItemWrapper
                  isSelected={section.id === selectedSection}
                  onClick={() => {
                    setSelectedSection(
                      section.id !== selectedSection ? section.id : undefined
                    );
                  }}
                  role="button"
                >
                  <Styled.IconWrapper color={section.color}>
                    <Folder />
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
                      >
                        <Anchor
                          href={href}
                          key={`notebook-item-${notebook.id}`}
                        >
                          <Styled.ItemWrapper marginLeft={22}>
                            <Styled.IconWrapper>
                              <Sheet />
                            </Styled.IconWrapper>
                            <Styled.TextWrapper>
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
      <div css={{ padding: '10px 0' }}>
        <Divider />
      </div>
      <Styled.NavigationTitle>Notebook Data</Styled.NavigationTitle>
      {numberCatalog}
    </Styled.NavigationSidebarWrapperStyles>
  );
};
