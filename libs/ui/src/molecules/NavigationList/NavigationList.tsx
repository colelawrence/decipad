import { css } from '@emotion/react';
import { ReactNode, Children, FC } from 'react';
import { isElement } from 'react-is';

import { NavigationItem } from '../../atoms';
import { WorkspaceItem } from '..';

const styles = css({
  display: 'grid',
  rowGap: '2px',
});

interface NavigationListProps {
  readonly children: ReactNode;
}

export const NavigationList = ({
  children,
}: NavigationListProps): ReturnType<FC> => {
  return (
    <ul css={styles}>
      {Children.map(children, (child) => {
        if (child == null) {
          return null;
        }
        if (
          isElement(child) &&
          (child.type === NavigationItem || child.type === WorkspaceItem)
        ) {
          return <li>{child}</li>;
        }
        console.error('Received child that is not a navigation item', child);
        throw new Error('Expected all children to be navigation items');
      })}
    </ul>
  );
};
