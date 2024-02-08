/* eslint decipad/css-prop-named-variable: 0 */
import React, { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';

import * as Styled from './styles';

interface NavigationListProps {
  readonly children: ReactNode;
  readonly level?: number;
}

export const NavigationList = ({
  children,
  level = 0,
}: NavigationListProps): ReturnType<FC> => {
  return (
    <Styled.List level={level}>
      {Children.map(children, (child) => {
        if (child == null) {
          return null;
        }
        if (isElement(child)) {
          const itemWithLevel = React.cloneElement(child, { level });

          return (
            <Styled.Item data-testid="navigation-list-item">
              {itemWithLevel}
            </Styled.Item>
          );
        }
        return child;
      })}
    </Styled.List>
  );
};
