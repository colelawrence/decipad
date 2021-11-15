import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { css } from '@emotion/react';
import { SlashCommandsMenuItem } from '../../atoms';
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

interface SlashCommandsMenuGroupProps {
  readonly title: string;
  readonly children?: ReactNode;
}
export const SlashCommandsMenuGroup = ({
  title,
  children,
}: SlashCommandsMenuGroupProps): ReturnType<FC> => {
  return (
    <div role="group">
      <div css={titleStyles}>{title}</div>
      <div css={itemsStyles}>
        {Children.map(children, (child) => {
          if (child == null) {
            return null;
          }
          if (isElement(child) && child.type === SlashCommandsMenuItem) {
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
