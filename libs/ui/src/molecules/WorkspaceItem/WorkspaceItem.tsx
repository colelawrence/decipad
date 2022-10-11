import { workspaces } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Avatar, NavigationItem } from '../../atoms';
import { Edit } from '../../icons';
import { cssVar, p12Regular, p14Medium, setCssVar } from '../../primitives';

const maxWidth = '176px';
const iconSize = '24px';
const padding = '8px';

const gridStyles = css({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '12px',

  width: '100%',
  maxWidth,
});

const styles = css({
  padding: `${padding} 0`,

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  rowGap: '4px',
  maxWidth: `calc(${maxWidth} - ${iconSize} - (${padding} * 2))`,
});

const iconStyles = css({
  alignSelf: 'center',
  height: '24px',
  width: '24px',

  ':hover': {
    backgroundColor: cssVar('strongerHighlightColor'),
    borderRadius: '6px',
  },
});

export interface WorkspaceItemProps {
  readonly id: string;
  readonly name: string;
  readonly numberOfMembers: number;
  readonly onClickEdit?: (id: string) => void;
}

export const WorkspaceItem = ({
  id,
  name,
  numberOfMembers,
  onClickEdit = noop,
}: WorkspaceItemProps): ReturnType<FC> => {
  const workspacePath = workspaces({}).workspace({ workspaceId: id });
  return (
    <NavigationItem
      href={workspacePath.$}
      icon={<Avatar name={name} roundedSquare />}
    >
      <span css={gridStyles}>
        <span css={styles}>
          <strong
            css={css(
              p14Medium,
              setCssVar('currentTextColor', cssVar('strongTextColor')),
              {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }
            )}
          >
            {name}
          </strong>
          <span css={css(p12Regular)}>
            {numberOfMembers} member{numberOfMembers === 1 ? '' : 's'}
          </span>
        </span>
        <button
          css={iconStyles}
          onClick={(e) => {
            // Doing navigation programatically instead of using an <Anchor> component because <a>
            // inside of an <a> is semantically forbidden.
            onClickEdit(id);
            e.preventDefault();
          }}
        >
          <Edit />
        </button>
      </span>
    </NavigationItem>
  );
};
