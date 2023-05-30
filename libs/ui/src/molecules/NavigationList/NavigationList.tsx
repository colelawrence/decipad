/* eslint decipad/css-prop-named-variable: 0 */
import { css, SerializedStyles } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { WorkspaceItem, WorkspaceItemCreate } from '..';
import { NavigationItem } from '../../atoms';

const styles = css({
  display: 'grid',
  rowGap: '2px',
});

interface NavigationListProps {
  readonly children: ReactNode;
  readonly wrapperStyles?: SerializedStyles;
}

export const NavigationList = ({
  children,
  wrapperStyles,
}: NavigationListProps): ReturnType<FC> => {
  return (
    <ul css={[styles, wrapperStyles]}>
      {Children.map(children, (child) => {
        if (child == null) {
          return null;
        }
        if (
          isElement(child) &&
          (child.type === NavigationItem ||
            child.type === WorkspaceItem ||
            child.type === WorkspaceItemCreate)
        ) {
          return <li data-testid="navigation-list-item">{child}</li>;
        }
        console.error('Received child that is not a navigation item', child);
        throw new Error('Expected all children to be navigation items');
      })}
    </ul>
  );
};
