/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import Fuse from 'fuse.js';
import { ComponentProps, lazy, Suspense, useMemo, useState } from 'react';
import { ColorStatus } from '../../atoms';
import { Generic, Info } from '../../icons';
import {
  DashboardDialogCTA,
  DragAndDropImportNotebook,
  EmptyWorkspaceCta,
  NotebookListItem,
} from '../../organisms';
import { useSearchBarStore } from '../../molecules';
import { cssVar, p13Medium, smallScreenQuery } from '../../primitives';
import { dashboard, notebookList } from '../../styles';
import {
  acceptableStatus,
  acceptableVisibility,
  buildFuseQuery,
  parseSearchInput,
} from '../../utils';

const loadWorkspaceCta = () =>
  import(/* webpackChunkName: "workspace-cta" */ './WorkspaceCTACard');
const WorkspaceCta = lazy(loadWorkspaceCta);

const fuseOptions = {
  minMatchCharLength: 2,
  useExtendedSearch: true,
  keys: ['name', 'isPublic', 'status'],
};

type TColorStatus = ComponentProps<typeof ColorStatus>['name'];

const listItemStyles = css({ position: 'relative' });

type NotebookListProps = {
  readonly notebooks: ReadonlyArray<
    Pick<
      ComponentProps<typeof NotebookListItem>,
      | 'id'
      | 'name'
      | 'isPublic'
      | 'onExport'
      | 'icon'
      | 'section'
      | 'iconColor'
      | 'creationDate'
      | 'status'
      | 'onExportBackups'
    > & {
      readonly id: string;
    }
  >;
  readonly onDuplicate?: (id: string) => void;
  readonly onMoveToWorkspace?: (id: string, workspaceId: string) => void;
  readonly onUnarchive?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
  readonly onChangeStatus?: (id: string, status: TColorStatus) => void;
  readonly onMoveToSection?: (padId: string, sectionId: string) => void;
  readonly onExport?: (id: string) => void;
  readonly showCTA?: boolean;
  readonly onCTADismiss?: () => void;
  readonly onCreateNotebook?: () => void;
  readonly otherWorkspaces?: { id: string; name: string }[];
  readonly onPointerEnter?: () => void;
  readonly Heading: 'h1';
  readonly mainWorkspaceRoute?: boolean;
  readonly isLoading?: boolean;
} & Omit<ComponentProps<typeof DragAndDropImportNotebook>, 'children'> &
  Pick<ComponentProps<typeof NotebookListItem>, 'page'>;

export const NotebookList = ({
  notebooks,
  onDuplicate = noop,
  onChangeStatus = noop,
  onMoveToWorkspace = noop,
  onMoveToSection = noop,
  onDelete = noop,
  onUnarchive = noop,
  showCTA = false,
  onCTADismiss = noop,
  page,
  mainWorkspaceRoute = false,
  onImport,

  onCreateNotebook = noop,
  otherWorkspaces = [],
  onPointerEnter,
}: NotebookListProps): ReturnType<React.FC> => {
  const { search, status, visibility } = useSearchBarStore();
  const fuse = useMemo(() => new Fuse(notebooks, fuseOptions), [notebooks]);
  const searchResults = useMemo(() => {
    const [include, exclude] = parseSearchInput(search);
    const params = [
      ...acceptableStatus(status),
      ...acceptableVisibility(visibility),
    ].flat();
    const query = buildFuseQuery({
      include,
      exclude: exclude || [],
      params: params.filter((a) => a !== undefined),
    });
    return fuse.search(query);
  }, [search, status, visibility, fuse]);

  const noNulls = useMemo(
    () => status.filter((x) => x !== null) as string[],
    [status]
  );

  const displayNotebooks = useMemo(() => {
    const filteredNotebooks = notebooks.filter(
      (nt) =>
        (visibility === 'public' ? nt.isPublic === true : true) &&
        (visibility === 'private' ? nt.isPublic !== true : true) &&
        (noNulls.length > 0 && nt.status ? noNulls.includes(nt.status) : true)
    );

    return searchResults.length > 0
      ? searchResults
      : filteredNotebooks.map((n) => {
          return { item: n };
        });
  }, [notebooks, searchResults, visibility, noNulls]);

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
              canDismiss={displayNotebooks.length > 5}
              onCreateNewNotebook={onCreateNotebook}
            />
          </Suspense>
        )}
        {displayNotebooks.length ? (
          <div
            css={{
              alignSelf: 'start',
              paddingTop: '2px',
            }}
          >
            {searchResults.length === 0 && search !== '' && (
              <div css={[listItemStyles, noSearchWarningStyles]}>
                <span css={css({ width: 12, height: 12 })}>
                  <Info />
                </span>
                <span data-testid="no-correct-search-result">
                  None of the {notebooks.length} matches your search, so we are
                  showing all notebooks that match your filters.
                </span>
              </div>
            )}
            <ol className="notebookList">
              {displayNotebooks.map(({ item }, i) => {
                const { id, ...notebook } = item;
                return (
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
                      onMoveToSection={onMoveToSection}
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
                      page={page}
                      onExport={notebook.onExport}
                      onExportBackups={notebook.onExportBackups}
                      onChangeStatus={(st: TColorStatus) => {
                        onChangeStatus(id, st);
                      }}
                    />
                  </li>
                );
              })}
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

const notebookListWrapperStyles = css({
  padding: `2px ${notebookList.horizontalPadding}`,
  display: 'grid',
  [smallScreenQuery]: {
    paddingTop: '16px',
  },
});

const noSearchWarningStyles = css(p13Medium, {
  padding: 16,
  display: 'flex',
  whiteSpace: 'nowrap',
  backgroundColor: cssVar('highlightColor'),
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
});
