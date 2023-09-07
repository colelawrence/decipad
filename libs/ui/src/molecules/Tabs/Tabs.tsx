/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';

interface TabsProps {
  readonly children: ReactNode;
  readonly variant?: boolean;
  readonly fullWidth?: boolean;
  readonly useGrid?: boolean;
}

export const Tabs: FC<TabsProps> = ({
  children,
  variant = false,
  fullWidth = false,
  useGrid = false,
}): ReturnType<FC> => {
  return <div css={tabsStyles(variant, fullWidth, useGrid)}>{children}</div>;
};

const tabsStyles = (variant: boolean, fullWidth: boolean, useGrid: boolean) =>
  css(
    {
      width: fullWidth ? '100%' : 'fit-content',
      padding: '2px',
      height: '34px',
      backgroundColor: variant
        ? cssVar('backgroundMain')
        : cssVar('backgroundHeavy'),
      border: `1px solid ${cssVar('backgroundHeavy')}`,
      borderRadius: 8,
      gap: 0,
      button: {
        border: 'solid 1px transparent',
      },
    },
    useGrid
      ? {
          display: 'grid',
          gridAutoColumns: 'minmax(0, 1fr)',
        }
      : {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }
  );
