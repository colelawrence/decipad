/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { InlineMenuItem } from '../../atoms';
import { cssVar, p13Medium, setCssVar } from '../../primitives';

const titleStyles = css(
  p13Medium,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  { padding: '4px 2px' }
);

const itemsStyles = css({
  padding: '8px 4px',
  display: 'grid',
  rowGap: '16px',
});

interface InlineMenuGroupProps {
  readonly title?: string;
  readonly children?: ReactNode;
}
export const InlineMenuGroup = ({
  title,
  children,
}: InlineMenuGroupProps): ReturnType<FC> => {
  return (
    <div role="group">
      {title && <div css={titleStyles}>{title}</div>}
      <div css={itemsStyles}>
        {Children.map(children, (child) => {
          if (child == null) {
            return null;
          }
          if (isElement(child) && child.type === InlineMenuItem) {
            return child;
          }
          console.error(
            'Received child that is not a slash commands menu item',
            child
          );
          throw new Error(
            'Expected all children to be slash commands menu items'
          );
        })}
      </div>
    </div>
  );
};
