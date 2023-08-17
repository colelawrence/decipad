import { ComponentProps, FC } from 'react';
import { FilterBubbles } from '..';
import { ColorStatusNames } from '../../utils';
import { css } from '@emotion/react';
import { Archive, Folder, Globe } from '../../icons';
import { ColorStatusCircle } from '../../atoms';
import { tabletScreenQuery } from '../../primitives';
import { Section } from '../../organisms/WorkspaceNavigation/WorkspaceNavigation';
import { NotebookStatusDropdown } from './NotebookStatusDropdown';

export type NotebookStatusProps = Pick<
  ComponentProps<typeof NotebookStatusDropdown>,
  'status' | 'onChangeStatus'
> & {
  readonly isPublic: boolean;
  readonly isArchived: boolean;
  readonly section?: Section;
};

export const NotebookStatus: FC<NotebookStatusProps> = ({
  status,
  isPublic,
  section,
  isArchived,
  onChangeStatus,
}) => (
  <div css={notebookListTagsStyles}>
    <span css={notebookListInlineTags}>
      <NotebookStatusDropdown
        trigger={
          <div>
            <FilterBubbles
              description={ColorStatusNames[status]}
              iconStyles={css({ transform: 'translateY(1px)' })}
              icon={<ColorStatusCircle name={status} />}
            />
          </div>
        }
        status={status}
        onChangeStatus={onChangeStatus}
      />

      {isPublic ? (
        <FilterBubbles description="Published" icon={<Globe />} />
      ) : null}

      {section?.name ? (
        <FilterBubbles description={section.name} icon={<Folder />} />
      ) : null}

      {isArchived && <FilterBubbles description="Archive" icon={<Archive />} />}
    </span>
  </div>
);

const notebookListInlineTags = css({
  display: 'flex',
  gap: 8,
});

const notebookListTagsStyles = css({
  gridArea: 'tags',
  display: 'grid',
  paddingLeft: 36,
  [tabletScreenQuery]: {
    display: 'none',
  },
});
