import { NotebookMetaDataFragment } from '@decipad/graphql-client';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { FilterBubbles } from '../../../shared/molecules';
import { ColorStatusCircle } from '../../../shared/atoms';
import { Archive, Folder, Globe } from '../../../icons';
import { tabletScreenQuery } from '../../../primitives';
import { ColorStatusNames } from '../../../utils';
import { NotebookStatusDropdown } from './NotebookStatusDropdown';

export type NotebookStatusProps = Pick<
  ComponentProps<typeof NotebookStatusDropdown>,
  'status' | 'onChangeStatus'
> & {
  readonly isPublic: boolean;
  readonly isArchived: boolean;
  readonly section?: string;
  readonly permissionType: NotebookMetaDataFragment['myPermissionType'];
};

export const NotebookStatus: FC<NotebookStatusProps> = ({
  status,
  isPublic,
  section,
  isArchived,
  onChangeStatus,
  permissionType,
}) => {
  return (
    <div css={notebookListTagsStyles} data-testid="notebook-state">
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
          permissionType={permissionType}
          status={status}
          onChangeStatus={onChangeStatus}
        />

        {isPublic ? (
          <FilterBubbles description="Published" icon={<Globe />} />
        ) : null}

        {section ? (
          <FilterBubbles
            description={section}
            icon={<Folder />}
            testid="notebook-section-tag"
          />
        ) : null}

        {isArchived && (
          <FilterBubbles description="Archive" icon={<Archive />} />
        )}
      </span>
    </div>
  );
};

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
