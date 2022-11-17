import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, lazy, Suspense, useState } from 'react';
import { Divider } from '../../atoms';
import { TColorStatus } from '../../atoms/ColorStatus/ColorStatus';
import {
  DragAndDropImportNotebook,
  EmptyWorkspaceCta,
  NotebookListItem,
} from '../../organisms';
import { cssVar, p15Medium, smallestDesktop } from '../../primitives';
import { notebookList } from '../../styles';

const loadWorkspaceCta = () =>
  import(/* webpackChunkName: "workspace-cta" */ './WorkspaceCTACard');
const WorkspaceCta = lazy(loadWorkspaceCta);

const mobileQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const notebookListWrapperStyles = css({
  padding: `${notebookList.verticalPadding} ${notebookList.horizontalPadding}`,
  display: 'grid',
  [mobileQuery]: {
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
    > & { readonly id: string }
  >;
  readonly onDuplicate?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
  readonly onChangeStatus?: (id: string, status: TColorStatus) => void;
  readonly onExport?: (id: string) => void;
  readonly showCTA?: boolean;
  readonly onCTADismiss?: () => void;
  readonly onCreateNotebook?: () => void;

  readonly onPointerEnter?: () => void;
} & Omit<ComponentProps<typeof DragAndDropImportNotebook>, 'children'> &
  ComponentProps<typeof EmptyWorkspaceCta>;

const listHeadingStyles = css(p15Medium, {
  color: cssVar('weakerTextColor'),
  marginBottom: '0.5rem',
});

export const NotebookList = ({
  notebooks,
  onDuplicate = noop,
  onChangeStatus = noop,
  onDelete = noop,
  showCTA = false,
  onCTADismiss = noop,

  onImport,

  Heading,
  onCreateNotebook = noop,

  onPointerEnter,
}: NotebookListProps): ReturnType<React.FC> => {
  const [openActionsId, setOpenActionsId] = useState<string>();

  return (
    <div css={notebookListWrapperStyles} onPointerEnter={onPointerEnter}>
      <DragAndDropImportNotebook onImport={onImport}>
        {showCTA && (
          <Suspense fallback={<></>}>
            <WorkspaceCta
              onDismiss={onCTADismiss}
              onCreateNewNotebook={onCreateNotebook}
            />
          </Suspense>
        )}
        {notebooks.length ? (
          <div css={{ alignSelf: 'start' }}>
            <Heading css={listHeadingStyles}>Name</Heading>
            <ol className="notebookList">
              {notebooks.map(({ id, ...notebook }, i) => (
                <li
                  key={id}
                  css={[
                    listItemStyles,
                    {
                      zIndex: openActionsId === id ? 1 : 0,
                    },
                  ]}
                >
                  {i === 0 || <Divider />}
                  <NotebookListItem
                    {...notebook}
                    id={id}
                    actionsOpen={openActionsId === id}
                    toggleActionsOpen={() =>
                      setOpenActionsId(openActionsId === id ? undefined : id)
                    }
                    onDuplicate={() => onDuplicate(id)}
                    onDelete={() => onDelete(id)}
                    onExport={notebook.onExport}
                    onChangeStatus={(status: TColorStatus) => {
                      onChangeStatus(id, status as TColorStatus);
                    }}
                  />
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div css={{ alignSelf: 'center' }}>
            <EmptyWorkspaceCta
              Heading={Heading}
              onCreateNotebook={onCreateNotebook}
            />
          </div>
        )}
      </DragAndDropImportNotebook>
    </div>
  );
};
