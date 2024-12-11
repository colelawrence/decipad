import { css } from '@emotion/react';
import { cssVar, p12Medium, p14Medium, p8Medium } from 'libs/ui/src/primitives';

export const IntegrationItemStyled = css({
  display: 'grid',
  alignItems: 'center',
  gap: '0 12px',
  // height: '56px',

  gridTemplateColumns: '40px 1fr max-content',
  gridTemplateRows: 'min-content 1fr',

  cursor: 'pointer',

  borderRadius: '8px',
  // border: `1px solid ${cssVar('borderSubdued')}`,

  'h2, p': {
    gridColumn: '2/3',
  },

  '& > span': {
    display: 'flex',
    gap: '8px',
    flexDirection: 'row',
    gridRow: '1/3',
  },

  '&[data-variant=modal]': {
    padding: '8px',
    border: `1px solid ${cssVar('borderSubdued')}`,
    gridTemplateRows: '1fr 1fr',
    rowGap: '4px',
    h2: {
      ...p14Medium,
      lineHeight: '0.8rem',
      color: cssVar('textHeavy'),
      alignSelf: 'end',
    },
    p: {
      alignSelf: 'start',
    },

    '& > span': {
      gridColumn: '3/4',
    },

    '&:hover': {
      background: cssVar('backgroundHeavy'),
    },
  },

  '&[data-single=true]': {
    gridTemplateRows: '1fr',
    h2: {
      alignSelf: 'center',
    },
  },
});

export const IntegrationItemIconWrapper = css({
  display: 'grid',
  placeItems: 'center',
  gridRow: '1/3',
  flexShrink: 0,
  width: '40px',
  height: '40px',
  backgroundColor: cssVar('iconBackground'),
  borderRadius: '8px',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const IntegrationItemTextAndActions = css({
  display: 'flex',
  width: '100%',
  alignItems: 'center',

  p: {
    display: 'flex',
    gap: '4px',
  },

  'div:first-of-type': {
    width: '100%',
    flexDirection: 'column',
    gap: '4px',

    'p:last-of-type': {
      color: cssVar('textSubdued'),
    },

    'p:first-of-type': {
      color: cssVar('textTitle'),
    },
  },

  'div:last-of-type': {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',

    div: {
      padding: '6px',
      borderRadius: '4px',
    },

    svg: {
      width: '16px',
      height: '16px',
    },
  },
});

export const IntegrationItemIconDisabledWrapper = css(
  IntegrationItemIconWrapper,
  {
    backgroundColor: cssVar('iconColorSubdued'),
    svg: {
      filter: 'grayscale(1)',
    },
  }
);

export const IntegrationItemDisabledTextAndActions = css(
  IntegrationItemTextAndActions,
  {
    p: { color: `${cssVar('textDisabled')} !important` },
  }
);

export const IntegrationDeleteText = css(p12Medium, {
  width: '160px',
  textAlign: 'right',
});

export const IntegrationSoonTag = css(p8Medium, {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4px',
  borderRadius: '4px',
  backgroundColor: cssVar('backgroundHeavier'),
});

export const IntegrationActionItemStyled = css(IntegrationItemStyled, {
  cursor: 'default',
  '&[data-variant=modal]:hover': {
    backgroundColor: 'inherit',
  },
});

export const IntegrationButton = css({
  justifySelf: 'flex-end',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});
