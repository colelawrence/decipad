import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, lazy, Suspense, useState } from 'react';
import { TColorStatus } from '../../atoms/ColorStatus/ColorStatus';
import { Generic } from '../../icons';
import {
  DashboardDialogCTA,
  DragAndDropImportNotebook,
  EmptyWorkspaceCta,
  NotebookListItem,
} from '../../organisms';
import { cssVar, p15Medium, smallScreenQuery } from '../../primitives';
import { dashboard, notebookList } from '../../styles';

const loadWorkspaceCta = () =>
  import(/* webpackChunkName: "workspace-cta" */ './WorkspaceCTACard');
const WorkspaceCta = lazy(loadWorkspaceCta);

const notebookListWrapperStyles = css({
  padding: `2px ${notebookList.horizontalPadding}`,
  display: 'grid',
  [smallScreenQuery]: {
    paddingTop: '16px',
  },
});

const listItemStyles = css({ position: 'relative' });

type NotebookListProps = {
  readonly notebooks: ReadonlyArray<
    Pick<
      ComponentProps<typeof NotebookListItem>,
      | 'id'
      | 'name'
      | 'onExport'
      | 'icon'
      | 'iconColor'
      | 'creationDate'
      | 'status'
    > & {
      readonly id: string;
    }
  >;
  readonly onDuplicate?: (id: string) => void;
  readonly onMoveToWorkspace?: (id: string, workspaceId: string) => void;
  readonly onUnarchive?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
  readonly onChangeStatus?: (id: string, status: TColorStatus) => void;
  readonly onExport?: (id: string) => void;
  readonly showCTA?: boolean;
  readonly onCTADismiss?: () => void;
  readonly onCreateNotebook?: () => void;
  readonly otherWorkspaces?: { id: string; name: string }[];
  readonly onPointerEnter?: () => void;
} & Omit<ComponentProps<typeof DragAndDropImportNotebook>, 'children'> & {
    readonly Heading: 'h1';
    readonly page?: string;
    readonly mainWorkspaceRoute?: boolean;
  };

const listHeadingStyles = css(p15Medium, {
  color: cssVar('weakerTextColor'),
  marginBottom: '0.5rem',
});

export const NotebookList = ({
  notebooks,
  onDuplicate = noop,
  onChangeStatus = noop,
  onMoveToWorkspace = noop,
  onDelete = noop,
  onUnarchive = noop,
  showCTA = false,
  onCTADismiss = noop,
  page = '',
  mainWorkspaceRoute = false,
  onImport,

  Heading,
  onCreateNotebook = noop,
  otherWorkspaces = [],
  onPointerEnter,
}: NotebookListProps): ReturnType<React.FC> => {
  const [openActionsId, setOpenActionsId] = useState<string>();

  return (
    <div css={notebookListWrapperStyles} onPointerEnter={onPointerEnter}>
      <DragAndDropImportNotebook
        enabled={mainWorkspaceRoute}
        onImport={onImport}
      >
        {showCTA && (
          <Suspense fallback={<></>}>
            <WorkspaceCta
              onDismiss={onCTADismiss}
              canDismiss={notebooks.length > 5}
              onCreateNewNotebook={onCreateNotebook}
              variant={page === 'published'}
            />
          </Suspense>
        )}
        {notebooks.length ? (
          <div
            css={{
              alignSelf: 'start',
              paddingTop: '2px',
            }}
          >
            <Heading css={listHeadingStyles}>Name</Heading>
            <ol className="notebookList">
              {notebooks.map(({ id, ...notebook }, i) => (
                <li
                  key={i}
                  css={[
                    listItemStyles,
                    {
                      zIndex: openActionsId === id ? 1 : 0,
                    },
                  ]}
                >
                  <NotebookListItem
                    {...notebook}
                    id={id}
                    actionsOpen={openActionsId === id}
                    toggleActionsOpen={() =>
                      setOpenActionsId(openActionsId === id ? undefined : id)
                    }
                    otherWorkspaces={otherWorkspaces}
                    onDuplicate={() => onDuplicate(id)}
                    onDelete={() => onDelete(id)}
                    onMoveToWorkspace={(workspaceId) =>
                      onMoveToWorkspace(id, workspaceId)
                    }
                    onUnarchive={() => onUnarchive(id)}
                    archivePage={page === 'archived'}
                    onExport={notebook.onExport}
                    onChangeStatus={(status: TColorStatus) => {
                      onChangeStatus(id, status as TColorStatus);
                    }}
                  />
                </li>
              ))}
            </ol>
          </div>
        ) : showCTA ? null : mainWorkspaceRoute ? (
          <div css={emptywRapperStyles(showCTA)}>
            <EmptyWorkspaceCta onCreateNotebook={onCreateNotebook} />
          </div>
        ) : (
          <div css={emptywRapperStyles(showCTA)}>
            <DashboardDialogCTA
              icon={<Generic />}
              primaryText={'No documents to list'}
              secondaryText={
                'When you create a document they will show up here'
              }
            />
          </div>
        )}
      </DragAndDropImportNotebook>
    </div>
  );
};

export const emptywRapperStyles = (showCTA: boolean) =>
  css({
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignContent: 'space-around',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: showCTA ? `calc(100%-${dashboard.CTAHeight})` : '100%',
  });
