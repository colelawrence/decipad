import styled from '@emotion/styled';
import {
  cssVar,
  mediumShadow,
  smallScreenQuery,
  tabletScreenQuery,
} from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';

// needed for screenshot testing
const isE2E = 'navigator' in globalThis && navigator.webdriver;

interface IsEmbed {
  isEmbed: boolean;
}

const SIDEBAR_WIDTH = '320px';
const ASSISTANT_WIDTH = '640px';

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
  padding: '0px 24px 12px',
  gap: '24px',

  [smallScreenQuery]: {
    // paddingBottom: isEmbed ? 0 : 65,
  },

  /* Embed conditional styles */
  ...(props.isEmbed && {
    order: 1,
    padding: '0px',
  }),

  // !isE2E && { height: isEmbed ? 'fit-content' : '100%' },
}));

type ArticleWrapperProps = IsEmbed & {
  isSidebarOpen: boolean;
  isAssistantOpen: boolean;
};

export const ArticleWrapper = styled.article<ArticleWrapperProps>((props) => ({
  backgroundColor: cssVar('backgroundHeavy'),
  height: '100%',
  width: props.isSidebarOpen
    ? `calc(100% - ${SIDEBAR_WIDTH})`
    : props.isAssistantOpen
    ? `calc(100% - ${ASSISTANT_WIDTH})`
    : '100%',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',

  [tabletScreenQuery]: {
    width: '100%',
  },

  /* Embed conditional styles */
  ...(props.isEmbed && {
    margin: '0px',
  }),
}));

export const NotebookSpacingWrapper = styled.div(deciOverflowYStyles, {
  backgroundColor: cssVar('backgroundMain'),
  borderRadius: '16px',
  paddingTop: '64px',
  paddingBottom: '200px',
  width: '100%',
  height: '100%',
  overflowX: 'hidden',
  [smallScreenQuery]: {
    padding: '12px 24px',
  },
});

interface AsideWrapperProps {
  readonly isSidebarOpen: boolean;
  readonly isAssistantOpen: boolean;
}

export const AsideWrapper = styled.aside<AsideWrapperProps>((props) => ({
  position: 'relative',
  marginRight: '-24px',
  display: 'flex',
  justifyContent: 'flex-end',
  overflowY: 'auto',
  flexShrink: 0,
  flexBasis: props.isSidebarOpen
    ? SIDEBAR_WIDTH
    : props.isAssistantOpen
    ? ASSISTANT_WIDTH
    : '0px',
  backgroundColor: cssVar('backgroundMain'),
  height: '100%',
  borderRadius: '16px 0px 0px 16px',
  zIndex: 40,

  [smallScreenQuery]: {
    display: 'none',
  },
  [tabletScreenQuery]: {
    position: 'fixed',
    height: 'calc(100vh - 82px)',
    border: `solid 1px ${cssVar('borderDefault')}`,
    borderRight: 'none',
    boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
  },
}));
