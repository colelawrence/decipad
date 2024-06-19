import { css } from '@emotion/react';
import { cssVar, p12Medium, p8Medium } from 'libs/ui/src/primitives';

export const IntegrationItemStyled = css({
  display: 'flex',
  padding: '8px',
  alignItems: 'center',
  gap: '12px',

  borderRadius: '8px',
  border: `1px solid ${cssVar('borderSubdued')}`,
});

export const IntegrationItemIconWrapper = css({
  display: 'grid',
  placeItems: 'center',
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

export const IntegrationActionItemStyled = css(IntegrationItemStyled);

export const IntegrationButton = css({
  justifySelf: 'flex-end',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});
