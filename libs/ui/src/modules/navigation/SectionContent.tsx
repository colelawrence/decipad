import { FC, useState } from 'react';
import { SectionContentProps } from './types';
import { notebooks as notebooksRouting } from '@decipad/routing';
import * as Styled from './styles';
import { Folder, FolderOpen } from '../../icons';
import { NotebookNavigation } from './NotebookNavigation';

export const SectionContent: FC<SectionContentProps> = ({
  section,
  notebooks,
  selectedSection,
  setSelectedSection,
  workspaceId,
  workspaces,
  actions,
  notebookId,
  sections,
}) => {
  const [sectionHovered, setSectionHovered] = useState<string | undefined>(
    undefined
  );
  return (
    <>
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
          {section.id !== selectedSection && section.id !== sectionHovered && (
            <Folder />
          )}
          {(section.id === selectedSection ||
            section.id === sectionHovered) && <FolderOpen />}
        </Styled.IconWrapper>
        <Styled.TextWrapper>{section.name}</Styled.TextWrapper>
      </Styled.ItemWrapper>
      {section.id === selectedSection && [
        notebooks.map((notebook) => {
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
            />
          );
        }),
      ]}
    </>
  );
};
