import { editorLayout, scrollbars, smallScreenQuery } from '@decipad/ui';
import { css } from '@emotion/react';
import {
  slimBlockWidth,
  wideBlockWidth,
} from 'libs/ui/src/styles/editor-layout';

export const gutterWidth = '40px';

export const dataViewTableWrapperStyles = css(
  {
    transform: `translateX(calc((((100vw - ${slimBlockWidth}px) / 2)) * -1 ))`,
    width: '100vw',
    minWidth: editorLayout.slimBlockWidth,
    paddingBottom: '2px',
    paddingRight: 18,
    position: 'relative',
    whiteSpace: 'nowrap',
    display: 'flex',
    [smallScreenQuery]: {
      maxWidth: `calc(100vw - ${gutterWidth})`,
      minWidth: '0',
      transform: `translateX(0)`,
    },
  },
  scrollbars.deciInsideNotebookOverflowXStyles
);

export const scrollRightOffset = `(((100vw - 1055px) / 2) + 200px)`;

export const tableScroll = css({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: gutterWidth,
  paddingRight: `calc(${scrollRightOffset})`,
  [smallScreenQuery]: {
    paddingRight: '0px',
    marginLeft: '0px',
  },
});

export const dataViewTableOverflowStyles = css({
  display: 'inline-block',
  height: '20px',
  minWidth: `calc((100vw - ${wideBlockWidth}px) / 2)`,
});

export const textWidth = css`
  max-width: 220px;
`;

export const stickyLeftColumn = css({
  position: 'sticky',
  top: 0,
  left: `calc(100vw / 2 - ${slimBlockWidth}px / 2)`,
  [smallScreenQuery]: {
    left: 0,
  },
});

export const stickySecondLeftColumn = css({
  left: `calc(100vw / 2 - ${slimBlockWidth}px / 2 + 8px)`,
});

export const rightAddColumnWrapper = css({
  position: 'absolute',
  top: -2,
  left: '100%',
  transition: 'left .4s',
  filter:
    'drop-shadow(0 0 2px white) drop-shadow(0 0 8px white) drop-shadow(0 0 12px white) drop-shadow(0 0 12px white) drop-shadow(0 0 24px white)',
});

export const rightAddColumnWhenEmpty = css({
  left: -8,
});
