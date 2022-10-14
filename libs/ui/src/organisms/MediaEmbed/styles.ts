import { css } from '@emotion/react';
import { cssVar } from '../../primitives/index';

export const rootStyles = css({
  padding: '10px 10px',
});

export const resizableStyles = css({
  height: 'auto !important',
  padding: 8,
  borderRadius: 8,
});

export const resizableSelectedStyles = css({
  background: cssVar('tableSelectionBackgroundColor'),
});

export const figureStyles = css({
  margin: 0,
  position: 'relative',
});

export const captionStyles = css({
  cursor: 'text',
});

export const captionTextareaStyles = css({
  padding: '0',
  marginTop: 8,
  width: '100%',
  borderStyle: 'none',
  resize: 'none',
  font: 'inherit',
  color: 'inherit',
  backgroundColor: 'inherit',
  textAlign: 'center',
  ':focus': { '::placeholder': { opacity: 0 } },
});

export const handleStyles = css({
  display: 'flex',
  position: 'absolute',
  top: '0',
  zIndex: 10,
  flexDirection: 'column',
  justifyContent: 'center',
  width: '1.5rem',
  height: '100%',
  userSelect: 'none',

  '::after': {
    display: 'flex',
    opacity: 0,
    content: "' '",
    width: '3px',
    height: '64px',
    borderRadius: '6px',

    // Handle color:
    // backgroundColor: grey100.rgb,
  },

  // Handle color:
  // ':hover,:focus,:active': { '::after': { background: brand500.rgb } },
});

export const handleSelectedStyles = css({
  '::after': {
    opacity: 1,
  },
});

export const handleLeftStyles = css([
  handleStyles,
  {
    left: -12,
    paddingLeft: 12,
    marginLeft: -12,
  },
]);

export const handleRightStyles = css([
  handleStyles,
  {
    right: -12,
    paddingRight: 12,
    marginRight: -12,
    alignItems: 'flex-end',
  },
]);

export const draggableStyles = css({
  paddingTop: 8,
});
