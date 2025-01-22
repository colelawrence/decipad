/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { gridShiftScreenQuery, smallScreenQuery } from 'libs/ui/src/primitives';
import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { FC, forwardRef, ReactNode } from 'react';

export const EditorLayout = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref): ReturnType<FC> => {
    return (
      <div ref={ref} css={editorLayoutStyles} data-stop-animate-query>
        {children}
      </div>
    );
  }
);

const editorLayoutStyles = css({
  '[data-slate-editor]': {
    margin: '0 auto',
    zIndex: 10,

    display: 'grid',
    gridTemplateColumns: `64px 1fr ${slimBlockWidth}px 1fr 64px`,
    width: '100%',

    flexDirection: 'column',

    position: 'relative',

    [gridShiftScreenQuery]: {
      gridTemplateColumns: `1fr ${slimBlockWidth}px 1fr`,
    },
    [smallScreenQuery]: {
      gridTemplateColumns: `1fr`,
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },
});
