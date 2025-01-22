import { css } from '@emotion/react';
import {
  componentCssVars,
  gridShiftScreenQuery,
  p16Regular,
  smallScreenQuery,
} from 'libs/ui/src/primitives';
import { DRAG_HANDLE_CLASS } from '../BlockDragHandle/BlockDragHandle';
import { BLOCK_CONTEXTUAL_ACTIONS } from '../BlockContextualActions/BlockContextualActions';
import { noTrackScrollbarStyles } from 'libs/ui/src/styles/scrollbars';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';

// Server as the base vertical space between elements. It's the same height as a 1-liner paragraph.
const defaultVerticalSpacing = `calc(${p16Regular.lineHeight})`;

export const SLATE_SELECTABLE_DIV = 'slate-selectable';
export const DRAGGABLE_BLOCK_DIV = 'draggable-block-div';

const spacingStyles = css({
  rowGap: defaultVerticalSpacing,
  // Headings
  '&[data-type^=heading] + *': {
    rowGap: `calc(${defaultVerticalSpacing} / 2)`,
  },
  '&[data-type^=heading] + [data-type=divider] + *': {
    rowGap: `calc(${defaultVerticalSpacing} / 2)`,
  },

  // Paragraphs
  '&[data-type=paragraph] + [data-type=list]': {
    rowGap: `8px`,
  },

  // Live integrations
  '&[data-type=live] + *': {
    rowGap: `40px`,
  },

  '&[data-type=live]': {
    rowGap: `8px`,
  },

  // Lists
  '&[data-type=list] [data-type=list]': {
    rowGap: 0,
  },

  // Code Lines
  '&[data-type=codeLine] + [data-type=codeLine]': {
    rowGap: 0,

    '> div.add-new-line': {
      button: {
        padding: '2px',
      },
    },
  },

  // Code Lines
  '&[data-type=structured] + [data-type=structured]': {
    rowGap: 0,

    '> div.add-new-line': {
      button: {
        padding: '2px',
      },
    },
  },

  // Tables
  '&[data-type$=Table]': {
    paddingTop: '20px',

    gridColumn: 'span 5',
    [gridShiftScreenQuery]: {
      gridColumn: '1 / span 3',
    },
    [smallScreenQuery]: {
      gridColumn: '1 / span 1',
    },

    width: '100%',
    gridRowGap: '8px',

    // This is actually needed.
    // The `noTrackStyles` applies a `position: relative`, which messes with the horizontal overflow,
    // So we must have static positioning here.
    position: 'static',

    // TODO: extract this out.

    '> div.add-new-line': {
      gridColumn: '3 / span 1',
      [gridShiftScreenQuery]: {
        gridColumn: '2 / span 1',
      },
      [smallScreenQuery]: {
        display: 'none',
      },
    },

    // Refers to this components div
    [`> div.${DRAGGABLE_BLOCK_DIV}`]: {
      display: 'contents',
    },

    [`.${SLATE_SELECTABLE_DIV}`]: {
      display: 'contents',
    },

    [`> div.${DRAG_HANDLE_CLASS}`]: {
      gridColumn: '2 / span 1',
      [gridShiftScreenQuery]: {
        gridColumn: '1 / span 1',
      },
      [smallScreenQuery]: {
        display: 'none',
      },
    },

    [`div.${BLOCK_CONTEXTUAL_ACTIONS}`]: {
      gridColumn: '4 / span 1',
      [gridShiftScreenQuery]: {
        gridColumn: '3 / span 1',
      },
      [smallScreenQuery]: {
        display: 'none',
      },
    },
  },

  '[data-type$=layout] &': {
    rowGap: 0,
  },
});

const hoverOpacityStyles = css({
  [`> div.${DRAG_HANDLE_CLASS}, div.${BLOCK_CONTEXTUAL_ACTIONS}`]: {
    transition: 'opacity ease-in-out 0.2s',
    opacity: 0,
  },

  ':hover, div.drag-preview &': {
    [`> div.${DRAG_HANDLE_CLASS}, div.${BLOCK_CONTEXTUAL_ACTIONS}`]: {
      opacity: 1,
    },
  },
});

const gridCommonStyles = css({
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  gridColumn: '2 / span 3',

  [gridShiftScreenQuery]: {
    gridColumn: '1 / span 3',
  },
  [smallScreenQuery]: {
    gridColumn: '1 / span 1',
  },

  [`> div.${DRAGGABLE_BLOCK_DIV}, > div.${DRAG_HANDLE_CLASS}, > div.${BLOCK_CONTEXTUAL_ACTIONS}`]:
    {
      gridRow: '2',
    },

  [`> div.${DRAG_HANDLE_CLASS}, > div.${BLOCK_CONTEXTUAL_ACTIONS}`]: {
    [smallScreenQuery]: {
      display: 'none',
    },
  },

  '&[data-fullwidth=true]': {
    gridColumn: '1 / span 5',
    [gridShiftScreenQuery]: {
      gridColumn: '1 / span 3',
    },
    [smallScreenQuery]: {
      gridColumn: '1 / span 1',
    },

    [`> div.${DRAGGABLE_BLOCK_DIV}`]: {
      gridColumn: '2 / span 3',
      [gridShiftScreenQuery]: {
        gridColumn: '2 / span 1',
      },
      [smallScreenQuery]: {
        gridColumn: '1 / span 1',
      },
    },
  },
});

const gridOrderingStyles = css({
  '&[data-type="title"]': {
    gridColumn: '3 / span 1',
    [gridShiftScreenQuery]: {
      gridColumn: '2 / span 1',
    },
    [smallScreenQuery]: {
      gridColumn: '1 / span 1',
    },
  },

  // TODO: extract out
  [`> div.add-new-line`]: {
    gridColumn: '2 / span 1',
  },

  '&[data-fullwidth=true]': {
    [`> div.add-new-line`]: {
      gridColumn: '3 / span 1',
      [gridShiftScreenQuery]: {
        gridColumn: '2 / span 1',
      },
      [smallScreenQuery]: {
        display: 'none',
      },
    },
  },
});

const gridOrderingReadOnlyStyles = css({
  [`> div.${DRAGGABLE_BLOCK_DIV}`]: {
    gridColumn: '2 / span 1',
  },

  '&[data-fullwidth=true]': {
    gridColumn: '1 / span 5',

    [`> div.${DRAGGABLE_BLOCK_DIV}`]: {
      gridColumn: '2 / span 3',
    },
  },
});

const selectedStyles = css({
  '&[data-selected=true]': {
    [`> div.${DRAGGABLE_BLOCK_DIV}`]: {
      borderRadius: '8px',
      backgroundColor: componentCssVars('SelectedBlockColor'),
    },
  },
});

const hiddenStyles = css({
  '&[data-hidden="true"]': hideOnPrint,
});

const commonStyles = css(
  noTrackScrollbarStyles,
  hiddenStyles,
  spacingStyles,
  hoverOpacityStyles,
  gridCommonStyles,
  selectedStyles
);

export const editableEditorBlock = css(commonStyles, gridOrderingStyles);
export const readOnlyEditorBlock = css(
  commonStyles,
  gridOrderingReadOnlyStyles
);
