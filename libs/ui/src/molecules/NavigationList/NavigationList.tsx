import { css } from '@emotion/react';
import { ReactNode, Children } from 'react';
import { isElement } from 'react-is';

import { NavigationItem } from '../../atoms';

const styles = css({
  display: 'grid',
  rowGap: '8px',
});

interface NavigationListProps {
  readonly children: ReactNode;
}

export const NavigationList = ({ children }: NavigationListProps) => {
  Children.forEach(children, (child) => {
    if (child == null || (isElement(child) && child.type === NavigationItem))
      return;
    throw new Error(
      `Expected all children to be of type NavigationItem, received ${JSON.stringify(
        child
      )}`
    );
  });
  return <ul css={styles}>{children}</ul>;
};
