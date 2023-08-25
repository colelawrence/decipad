import styled from '@emotion/styled';
import {
  cssVar,
  mediumShadow,
  shortAnimationDuration,
  smallScreenQuery,
  tabletScreenQuery,
} from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';

// needed for screenshot testing
const isE2E = 'navigator' in globalThis && navigator.webdriver;

interface IsEmbed {
  isEmbed: boolean;
}

/**
 * Used to wrap everything inside the app.
 */
export const AppWrapper = styled.div<IsEmbed>((props) => ({
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  ...(!isE2E &&
    props.isEmbed && {
      border: `1px solid ${cssVar('borderDefault')}`,
    }),

  /* E2E */
  ...(isE2E && {
    height: 'unset',
  }),

  'header:first-of-type': {
    height: '76px',
    width: '100%',
    padding: '0 32px',
    backgroundColor: cssVar('backgroundAccent'),
    display: 'flex',
    alignItems: 'center',

    /* Embed conditional styles */
    ...(props.isEmbed && {
      order: 2,
    }),
  },
}));

/**
 * Used to wrap the editor + sidebar
 */
export const MainWrapper = styled.main<IsEmbed>((props) => ({
  // min-height: 0 is very important
  // See: https://stackoverflow.com/questions/30861247/flexbox-children-does-not-respect-height-of-parent-with-flex-direction-column
  minHeight: '0px',
  height: '100%',
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: cssVar('backgroundAccent'),
  paddingBottom: '12px',

  [smallScreenQuery]: {
    // paddingBottom: isEmbed ? 0 : 65,
  },

  /* Embed conditional styles */
  ...(props.isEmbed && {
    order: 1,
    paddingBottom: '0px',
  }),

  // !isE2E && { height: isEmbed ? 'fit-content' : '100%' },
}));

export const ArticleWrapper = styled.article<IsEmbed>((props) => ({
  backgroundColor: cssVar('backgroundMain'),
  height: '100%',
  margin: '0px 24px',
  width: '100%',
  borderRadius: '16px',

  /* Embed conditional styles */
  ...(props.isEmbed && {
    margin: '0px',
  }),
}));

export const NotebookSpacingWrapper = styled.div(deciOverflowYStyles, {
  paddingTop: '64px',
  paddingBottom: '200px',
  width: '100%',
  height: '100%',
  overflowX: 'hidden',
  [smallScreenQuery]: {
    padding: '12px 24px',
  },
});

const SIDEBAR_WIDTH = '300px';

interface AsideWrapperProps {
  readonly isOpen: boolean;
}

export const AsideWrapper = styled.aside<AsideWrapperProps>((props) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  overflowY: 'auto',
  minWidth: props.isOpen ? SIDEBAR_WIDTH : 0,
  transition: `min-width ${shortAnimationDuration} ease-in-out, padding 0ms linear ${shortAnimationDuration}`,
  backgroundColor: cssVar('backgroundMain'),
  height: '100%',
  borderRadius: '16px 0px 0px 16px',

  [smallScreenQuery]: {
    display: 'none',
  },
  [tabletScreenQuery]: {
    position: 'fixed',
    border: `solid 1px ${cssVar('borderDefault')}`,
    boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
    zIndex: 9,
  },
}));
