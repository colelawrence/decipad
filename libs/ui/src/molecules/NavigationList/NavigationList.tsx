import { css } from '@emotion/react';
import { ReactNode, Children } from 'react';
import { isElement } from 'react-is';

import { NavigationItem } from '../../atoms';
import { WorkspaceItem } from '..';

const styles = css({
  display: 'grid',
  rowGap: '8px',
});

interface NavigationListProps {
  readonly children: ReactNode;
}

export const NavigationList = ({ children }: NavigationListProps) => {
  Children.forEach(children, (child) => {
    if (
      child == null ||
      (isElement(child) &&
        (child.type === NavigationItem || child.type === WorkspaceItem))
    ) {
      return;
    }
    console.error('Received child that is not a navigation item', child);
    throw new Error('Expected all children to be navigation items');
  });
  return <ul css={styles}>{children}</ul>;
};
