import { FC, forwardRef, ReactNode } from 'react';
import { slimBlockWidth } from '../../styles/editor-layout';

export const EditorLayout = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref): ReturnType<FC> => {
    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',

          position: 'relative',
        }}
        data-stop-animate-query
      >
        <div css={{ maxWidth: slimBlockWidth, width: '100%' }}>{children}</div>
      </div>
    );
  }
);
