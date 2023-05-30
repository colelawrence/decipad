/* eslint decipad/css-prop-named-variable: 0 */
import { FC, forwardRef, ReactNode } from 'react';
import { slimBlockWidth } from '../../styles/editor-layout';

export const EditorLayout = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref): ReturnType<FC> => {
    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
        }}
        css={{
          '[data-slate-editor]': {
            maxWidth: slimBlockWidth,
            margin: '0 auto',
            zIndex: 1,
          },
        }}
        data-stop-animate-query
      >
        {children}
      </div>
    );
  }
);
