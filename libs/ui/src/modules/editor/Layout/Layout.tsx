/* eslint decipad/css-prop-named-variable: 0 */
import { ReactNode, forwardRef } from 'react';
import { css } from '@emotion/react';

export const layoutColumnGap = 16;

const styles = (insufficientWidth: boolean) =>
  css({
    display: 'flex',
    gap: `${layoutColumnGap}px`,
    flexDirection: insufficientWidth ? 'column' : 'row',
    // Fallback, shouldn't be needed if insufficientWidth is working correctly
    flexWrap: 'wrap',
  });

export interface LayoutProps {
  insufficientWidth?: boolean;
  children: ReactNode;
}

export const Layout = forwardRef<HTMLUListElement, LayoutProps>(
  ({ insufficientWidth = false, children }, ref) => {
    return (
      <ul ref={ref} css={styles(insufficientWidth)}>
        {children}
      </ul>
    );
  }
);
