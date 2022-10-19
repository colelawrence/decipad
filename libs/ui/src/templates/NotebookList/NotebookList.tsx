import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, useState } from 'react';
import { Divider } from '../../atoms';
import {
  DragAndDropImportNotebook,
  EmptyWorkspaceCta,
  NotebookListItem,
} from '../../organisms';
import { smallestDesktop } from '../../primitives';
import { notebookList } from '../../styles';

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
      'id' | 'name' | 'onExport' | 'icon' | 'iconColor'
    > & { readonly id: string }
  >;
  readonly onDuplicate?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
  readonly onExport?: (id: string) => void;

  readonly onPointerEnter?: () => void;
} & Omit<ComponentProps<typeof DragAndDropImportNotebook>, 'children'> &
  ComponentProps<typeof EmptyWorkspaceCta>;

export const NotebookList = ({
  notebooks,
  onDuplicate = noop,
  onDelete = noop,

  onImport,

  Heading,
  onCreateNotebook,

  onPointerEnter,
}: NotebookListProps): ReturnType<React.FC> => {
  const [openActionsId, setOpenActionsId] = useState<string>();

  return (
    <div css={notebookListWrapperStyles} onPointerEnter={onPointerEnter}>
      <DragAndDropImportNotebook onImport={onImport}>
        {notebooks.length ? (
          <div css={{ alignSelf: 'start' }}>
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
