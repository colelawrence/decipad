import { FC, forwardRef, ReactNode } from 'react';
import { slimBlockWidth } from '../../styles/editor-layout';
import { mobileQuery } from '../../primitives/viewport';

export const EditorLayout = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref): ReturnType<FC> => {
    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
        }}
        css={{
          '.slate-SelectionArea': {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '30px',

            [mobileQuery]: {
              padding: '0 24px',
            },
          },

          '[data-slate-editor]': {
            width: '100%',
            maxWidth: slimBlockWidth,
            margin: '0px auto',
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
