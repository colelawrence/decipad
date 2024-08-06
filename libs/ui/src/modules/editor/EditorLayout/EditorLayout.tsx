/* eslint decipad/css-prop-named-variable: 0 */
import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { FC, forwardRef, ReactNode } from 'react';

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
            zIndex: 10,
          },
        }}
        data-stop-animate-query
      >
        {children}
      </div>
    );
  }
);
