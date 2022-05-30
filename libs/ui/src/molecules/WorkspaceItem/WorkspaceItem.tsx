import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Avatar, NavigationItem } from '../../atoms';
import { cssVar, p12Regular, p14Medium, setCssVar } from '../../primitives';

const styles = css({
  padding: '8px 0',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  rowGap: '4px',
});

export interface WorkspaceItemProps {
  readonly id: string;
  readonly name: string;
  readonly numberOfMembers: number;
}

export const WorkspaceItem = ({
  id,
  name,
  numberOfMembers,
}: WorkspaceItemProps): ReturnType<FC> => {
  return (
    <NavigationItem
      href={workspaces({}).workspace({ workspaceId: id }).$}
      icon={<Avatar name={name} roundedSquare />}
    >
      <span css={styles}>
        <strong
          css={css(
            p14Medium,
            setCssVar('currentTextColor', cssVar('strongTextColor'))
          )}
        >
          {name}
        </strong>
        <span css={css(p12Regular)}>
          {numberOfMembers} member{numberOfMembers === 1 ? '' : 's'}
        </span>
      </span>
    </NavigationItem>
  );
};
