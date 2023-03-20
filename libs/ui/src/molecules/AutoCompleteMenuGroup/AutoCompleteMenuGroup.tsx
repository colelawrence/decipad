import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { isElement } from 'react-is';
import { AutoCompleteMenuItem } from '../../atoms';
import { cssVar, p13Bold } from '../../primitives';

const styles = css({
  display: 'grid',
  gap: '4px',
  maxWidth: '200px',
});

const titleStyles = css(p13Bold, {
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  padding: '6px 5px 2px 5px',
  color: cssVar('weakTextColor'),
  maxWidth: '200px',
  overflowX: 'auto',
});

const itemsStyles = css({
  display: 'grid',
});

interface AutoCompleteMenuGroupProps {
  readonly title?: string;
  readonly isOnlyGroup?: boolean;
  readonly children?: ReactNode;
}
export const AutoCompleteMenuGroup = ({
  title,
  isOnlyGroup,
  children,
}: AutoCompleteMenuGroupProps): ReturnType<FC> => {
  return (
    <div css={styles} role="group">
      {!isOnlyGroup && title && <div css={titleStyles}>{title}</div>}
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
