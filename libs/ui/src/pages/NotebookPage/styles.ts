import styled from '@emotion/styled';
import {
  cssVar,
  mediumShadow,
  smallScreenQuery,
  tabletScreenQuery,
} from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { SidebarComponent } from '@decipad/react-contexts';

// needed for screenshot testing
const isE2E = 'navigator' in globalThis && navigator.webdriver;

const SIDEBAR_WIDTH = '320px';
const ASSISTANT_WIDTH = '640px';

/**
 * Used to wrap everything inside the app.
 */
export const AppWrapper = styled.div<{ isEmbed: boolean }>((props) => ({
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

  '& > header': {
    position: 'relative',
    height: '64px',
    width: '100%',
    padding: '0px 32px',
    backgroundColor: cssVar('backgroundAccent'),
    display: 'flex',
    alignItems: 'center',
    zIndex: 50,

    [smallScreenQuery]: {
      padding: '4px 8px 0px',
    },
  },
}));

/**
 * Used to wrap the editor + sidebar
 */
export const MainWrapper = styled.main<{ isEmbed: boolean; hasTabs: boolean }>(
  (props) => ({
    // min-height: 0 is very important
    // See: https://stackoverflow.com/questions/30861247/flexbox-children-does-not-respect-height-of-parent-with-flex-direction-column
    minHeight: '0px',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: cssVar('backgroundAccent'),
    padding: '0px 24px 4px',
    gap: '24px',

    [smallScreenQuery]: {
      padding: '0px 4px 12px',
      ...(props.hasTabs && {
        paddingBottom: '0px',
      }),
    },
  })
);

type ArticleWrapperProps = {
  isEmbed: boolean;
};

const ComponentWidths: Record<SidebarComponent, string> = {
  'default-sidebar': SIDEBAR_WIDTH,
  publishing: SIDEBAR_WIDTH,
  ai: ASSISTANT_WIDTH,
  closed: '0px',
};

export const ArticleWrapper = styled.article<ArticleWrapperProps>((props) => ({
  position: 'relative',
  minWidth: '0px',
  // min-width: 0 is very important
  // See: https://stackoverflow.com/questions/30861247/flexbox-children-does-not-respect-height-of-parent-with-flex-direction-column
  backgroundColor: cssVar('backgroundHeavy'),
  height: '100%',
  width: '100%',
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
    padding: '16px',
  },
});

interface AsideWrapperProps {
  readonly sidebarComponent: SidebarComponent;
}

export const AsideWrapper = styled.aside<AsideWrapperProps>((props) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'flex-end',
  overflowY: 'auto',
  flexShrink: 0,
  width: ComponentWidths[props.sidebarComponent],
  height: 'calc(100% - 12px)',
  borderRadius: '16px',
  zIndex: 40,

  [smallScreenQuery]: {
    display: 'none',
  },
  [tabletScreenQuery]: {
    position: 'fixed',
    // this is an offset to account for the header and bottom margin
    height:
      props.sidebarComponent === 'publishing'
        ? 'fit-content'
        : 'calc(100vh - 80px)',
    border: `solid 1px ${cssVar('borderDefault')}`,
    borderRight: 'none',
    boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
    padding: 0,
  },
}));
