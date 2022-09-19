import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Divider } from '../../atoms';
import { Delete } from '../../icons';
import { p14Regular } from '../../primitives';
import { card } from '../../styles';
import { Anchor } from '../../utils';

const styles = css({
  ...card.styles,
  padding: '4px 12px',
});
const actionStyles = css(p14Regular, {
  height: '40px',
  padding: '10px 0',

  display: 'grid',
  rowGap: '10px',
});

interface NotebookListItemActionsProps {
  readonly href: string;
  readonly onDuplicate?: () => void;
  readonly onDelete?: () => void;
  readonly onExport?: () => void;
}
export const NotebookListItemActions = ({
  href,
  onDuplicate = noop,
  onDelete = noop,
  onExport = noop,
}: NotebookListItemActionsProps): ReturnType<React.FC> => {
  return (
    <nav css={styles}>
      <ul>
        <li css={actionStyles}>
          <Anchor href={href}>Open</Anchor>
          <Divider />
        </li>
        <li css={actionStyles}>
          <a
            href={href}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              onExport();
            }}
          >
            Export
          </a>
          <Divider />
        </li>
        <li css={actionStyles}>
          <button css={{ display: 'flex' }} onClick={onDuplicate}>
            Duplicate
          </button>
          <Divider />
        </li>
        <li css={actionStyles}>
          <button
            onClick={onDelete}
            css={{ display: 'flex', alignItems: 'center' }}
          >
            <span
              css={{
                height: '16px',
                width: '16px',
              }}
            >
              <Delete />
            </span>
            Delete
          </button>
        </li>
      </ul>
    </nav>
  );
};
