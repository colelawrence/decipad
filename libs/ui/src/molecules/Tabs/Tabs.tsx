/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';

interface TabsProps {
  readonly children: ReactNode;
  readonly variant?: boolean;
}

export const Tabs: FC<TabsProps> = ({
  children,
  variant = false,
}): ReturnType<FC> => {
  return <div css={tabsStyles(variant)}>{children}</div>;
};

const tabsStyles = (variant: boolean) =>
  css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '2px',
    minWidth: 150,
    width: 'fit-content',
    backgroundColor: variant
      ? cssVar('backgroundColor')
      : cssVar('strongHighlightColor'),
    border: `1px solid ${cssVar('strongHighlightColor')}`,
    borderRadius: 8,
    gap: 0,
    button: {
      flex: 'none',
      order: 0,
      flexGrow: 0,
      border: 'solid 1px transparent',
    },
  });
