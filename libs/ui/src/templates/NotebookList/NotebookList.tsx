import { css } from '@emotion/react';
import { ComponentProps, useState } from 'react';
import { Divider } from '../../atoms';
import { EmptyWorkspaceCta, NotebookListItem } from '../../organisms';
import { cssVar, p13Regular, setCssVar } from '../../primitives';
import { notebookList } from '../../styles';
import { noop } from '../../utils';

const styles = css({
  padding: `${notebookList.verticalPadding} ${notebookList.horizontalPadding}`,
  display: 'grid',
});

type NotebookListProps = {
  readonly notebooks: ReadonlyArray<
    Pick<
      ComponentProps<typeof NotebookListItem>,
      'name' | 'description' | 'href'
    > & { readonly id: string }
  >;
  readonly onDuplicate?: (id: string) => void;
  readonly onDelete?: (id: string) => void;
} & ComponentProps<typeof EmptyWorkspaceCta>;
export const NotebookList = ({
  notebooks,
  onDuplicate = noop,
  onDelete = noop,
  ...props
}: NotebookListProps): ReturnType<React.FC> => {
  const [openActionsId, setOpenActionsId] = useState<string>();

  return (
    <div css={styles}>
      {notebooks.length ? (
        <div css={{ alignSelf: 'start' }}>
          <strong
            css={css(
              p13Regular,
              setCssVar('currentTextColor', cssVar('weakTextColor'))
            )}
          >
            Name
          </strong>
          <ol className="notebookList">
            {notebooks.map(({ id, ...notebook }, i) => (
              <li
                key={id}
                css={{
                  position: 'relative',
                  zIndex: openActionsId === id ? 1 : 0,
                }}
              >
                {i === 0 || <Divider />}
                <NotebookListItem
                  {...notebook}
                  actionsOpen={openActionsId === id}
                  toggleActionsOpen={() =>
                    setOpenActionsId(openActionsId === id ? undefined : id)
                  }
                  onDuplicate={() => onDuplicate(id)}
                  onDelete={() => onDelete(id)}
                />
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div css={{ alignSelf: 'center' }}>
          <EmptyWorkspaceCta {...props} />
        </div>
      )}
    </div>
  );
};
