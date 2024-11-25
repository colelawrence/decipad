import { notebooks as notebooksRouting } from '@decipad/routing';
import { Add, CaretDown, CaretRight } from '../../icons';
import { hexToOpaqueColor } from '../../primitives';
import { Spinner, Tooltip } from '../../shared';
import { colorSwatches, DNDItemTypes } from '../../utils';
import { NavigationList } from '../workspace/NavigationList/NavigationList';
import { SectionItem } from '../workspace/SectionItem/SectionItem';
import * as Styled from './styles';
import { NotebookNavigation } from './NotebookNavigation';
import { SectionContent } from './SectionContent';
import styled from '@emotion/styled';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { Panel } from 'react-resizable-panels';
import { FC, useState } from 'react';
import { useCreateNotebookMutation } from '@decipad/graphql-client';
import { NotebookNavigationPaneProps } from './types';
import { useToast } from '@decipad/toast';
import { useNavigate } from 'react-router-dom';
import { initNewDocument } from '@decipad/docsync';

const SectionWrapper = styled(Panel)(deciOverflowYStyles, {
  width: '100%',
  // Panel component sets an overflow: hidden internally...
  overflow: 'auto !important',
});

export const NotebookNavigationPane: FC<NotebookNavigationPaneProps> = ({
  sections,
  workspaceId,
  notebooks,
  notebookId,
  workspaces,
  actions,
}) => {
  const toast = useToast();
  const navigate = useNavigate();

  const sectionFromCurrentNotebook = notebooks?.find(
    (nb) => nb.id === notebookId
  )?.sectionId;

  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(
    sectionFromCurrentNotebook ?? undefined
  );

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

  const tooltipTriggerNotebook = (
    <Styled.AddButtonWrapper>
      <Styled.IconOuterWrapper highlightBackgroundOnHover={true}>
        <Styled.IconWrapper role="button" onClick={handleCreateNotebook}>
          {isCreatingNotebook ? <Spinner /> : <Add />}
        </Styled.IconWrapper>
      </Styled.IconOuterWrapper>
    </Styled.AddButtonWrapper>
  );

  const noSectionNotebooks =
    notebooks?.filter(
      (notebook) => !notebook.sectionId && !notebook.archived
    ) ?? [];

  return (
    <SectionWrapper minSize={5}>
      <Styled.NavigationTitleWrapper>
        <Styled.NavigationTitleInnerWrapper
          onClick={() => setIsNavigationExpanded(!isNavigationExpanded)}
        >
          <Styled.IconOuterWrapper>
            <Styled.IconWrapper>
              {isNavigationExpanded ? <CaretDown /> : <CaretRight />}
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
                  <SectionContent
                    section={section}
                    notebooks={notebooksPerSection}
                    selectedSection={selectedSection}
                    setSelectedSection={setSelectedSection}
                    workspaceId={workspaceId}
                    notebookId={notebookId}
                    sections={sections}
                    workspaces={workspaces}
                    actions={actions}
                  />
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
  );
};
