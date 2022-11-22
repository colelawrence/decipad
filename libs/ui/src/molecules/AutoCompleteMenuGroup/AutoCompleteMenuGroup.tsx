import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { AutoCompleteMenuItem } from '../../atoms';
import { cssVar, p13Medium } from '../../primitives';

const styles = css({
  display: 'grid',
  gap: '4px',
});

const titleStyles = css(p13Medium, {
  padding: '8px 8px 0px',
  color: cssVar('weakerTextColor'),
});

const itemsStyles = css({
  display: 'grid',
});

interface AutoCompleteMenuGroupProps {
  readonly title?: string;
  readonly children?: ReactNode;
}
export const AutoCompleteMenuGroup = ({
  title,
  children,
}: AutoCompleteMenuGroupProps): ReturnType<FC> => {
  return (
    <div css={styles} role="group">
      {title && <div css={titleStyles}>{title}</div>}
      <div css={itemsStyles}>
        {Children.map(children, (child) => {
          if (child == null) {
            return null;
          }
          if (isElement(child) && child.type === AutoCompleteMenuItem) {
            return child;
          }
          console.error(
            'Received child that is not an auto complete menu item',
            child
          );
          throw new Error(
            'Expected all children to be auto complete menu items'
          );
        })}
      </div>
    </div>
  );
};
