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
  readonly name: string;
  readonly numberOfMembers: number;

  readonly href: string;
}

export const WorkspaceItem = ({
  name,
  numberOfMembers,

  href,
}: WorkspaceItemProps): ReturnType<FC> => {
  return (
    <NavigationItem href={href} icon={<Avatar name={name} roundedSquare />}>
      <span css={styles}>
        <strong
          css={css({
            ...p14Medium,
            ...setCssVar('currentTextColor', cssVar('strongTextColor')),
          })}
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
