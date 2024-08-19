import { isFlagEnabled } from '@decipad/feature-flags';
import { SidebarComponent } from '@decipad/react-contexts';
import styled from '@emotion/styled';
import {
  cssVar,
  mediumShadow,
  smallScreenQuery,
  tabletScreenQuery,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { deciOverflowYStyles } from '../../styles/scrollbars';

// needed for screenshot testing
const isE2E = 'navigator' in globalThis && navigator.webdriver;

export const ANNOTATIONS_WIDTH = 320;
export const SIDEBAR_WIDTH = '320px';
const ASSISTANT_WIDTH = '640px';
const INTEGRATIONS_WIDTH = '600px';
const HEADER_HEIGHT = '64px';

/**
 * Used to wrap everything inside the app.
 */
export const AppWrapper = styled.div<{ isEmbed: boolean }>((props) => ({
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: cssVar('backgroundAccent'),

  ...(!isE2E &&
    props.isEmbed && {
      border: `1px solid ${cssVar('borderDefault')}`,
    }),

  // This is because Percy is funny with the snapshots.
  ...(isE2E && {
    height: 'unset',
  }),

  '& > header': {
    height: HEADER_HEIGHT,
    width: '100%',
    padding: '0px 24px',
    display: 'flex',
    alignItems: 'center',

    [smallScreenQuery]: {
      padding: '4px 8px 0px',
    },
  },
}));

/**
 * Used to wrap the editor + sidebar
 */
export const MainWrapper = styled.main<{
  isEmbed: boolean;
  hasTabs: boolean;
  isInEditorSidebar: boolean;
}>((props) => ({
  // min-height: 0 is very important
  // See: https://stackoverflow.com/questions/30861247/flexbox-children-does-not-respect-height-of-parent-with-flex-direction-column
  minHeight: '0px',
  height: '100%',
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',

  padding: props.isInEditorSidebar
    ? `0px 0px 16px ${!isFlagEnabled('NAV_SIDEBAR') ? '24' : '0'}px`
    : `0px 24px 16px ${!isFlagEnabled('NAV_SIDEBAR') ? '24' : '0'}px`,

  gap: '24px',
  [tabletScreenQuery]: {
    gap: 0,
    padding: '0px 16px 16px 16px',
  },
  [smallScreenQuery]: {
    padding: '0px 4px 12px',
    ...(props.hasTabs && {
      paddingBottom: '0px',
    }),
  },
}));

type ArticleWrapperProps = {
  isEmbed: boolean;
};

const ComponentWidths: Record<
  SidebarComponent,
  { default: string; tablet?: string; mobile?: string }
> = {
  'default-sidebar': { default: SIDEBAR_WIDTH },
  publishing: { default: SIDEBAR_WIDTH },
  ai: { default: ASSISTANT_WIDTH },
  closed: { default: '0px' },
  annotations: { default: '0px', tablet: '0px' },
  integrations: { default: INTEGRATIONS_WIDTH },
  'edit-integration': { default: INTEGRATIONS_WIDTH },
  'navigation-sidebar': { default: SIDEBAR_WIDTH },
};

export const ArticleWrapper = styled.article<ArticleWrapperProps>((props) => ({
  position: 'relative',
  minWidth: '0px',
  // min-width: 0 is very important
  // See: https://stackoverflow.com/questions/30861247/flexbox-children-does-not-respect-height-of-parent-with-flex-direction-column
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',

  [tabletScreenQuery]: {
    width: '100%',
  },

  /* Embed conditional styles */
  ...(props.isEmbed && {
    margin: '0px',
  }),
}));

export const EditorAndTabWrapper = styled.div({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',

  borderRadius: '16px',
  overflow: 'hidden',
});

export const TabWrapper = styled.div<{ isInEditorSidebar: boolean }>(
  (props) => ({
    display: 'flex',
    width: props.isInEditorSidebar
      ? `calc(100% - ${ANNOTATIONS_WIDTH}px - 32px)`
      : '100%',

    [tabletScreenQuery]: {
      width: '100%',
    },
  })
);

export const DataDrawer = styled.div<{ isInEditorSidebar: boolean }>(
  (props) => ({
    position: 'relative',
    zIndex: 50, // Above `dropzoneDetector`

    width: props.isInEditorSidebar
      ? `calc(100% - ${ANNOTATIONS_WIDTH}px - 32px)`
      : '100%',
    background: cssVar('backgroundMain'),
    borderRadius: '16px',
    padding: '16px',

    [tabletScreenQuery]: {
      width: '100%',
    },
  })
);

export const NotebookSpacingWrapper = styled.div([
  deciOverflowYStyles,
  {
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'scroll',

    width: '100%',

    [tabletScreenQuery]: {
      width: '100%',
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: cssVar('backgroundMain'),
    },
  },
]);

export const OverflowingEditor = styled.div({
  minHeight: '100%',
  width: '100%',
  display: 'flex',
  position: 'relative',
});

export const PaddingEditor = styled.div({
  width: '100%',

  backgroundColor: cssVar('backgroundMain'),
  paddingTop: '64px',
  paddingBottom: '200px',

  position: 'relative',
});

export const InEditorSidebar = styled.div({
  flexGrow: 0,
  minHeight: '100%',
  position: 'relative',
  zIndex: 100,

  [tabletScreenQuery]: {
    position: 'absolute',
    right: 0,
    width: '1px',
  },
});

interface AsideWrapperProps {
  readonly sidebarComponent: SidebarComponent;
  readonly position?: 'left' | 'right';
}

export const AsideWrapper = styled.aside<AsideWrapperProps>(
  hideOnPrint,
  ({ position = 'right', sidebarComponent }) => ({
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-end',
    overflowY: 'auto',
    flexShrink: 0,
    width: ComponentWidths[sidebarComponent].default,
    borderRadius: '16px',
    zIndex: 40,
    overflow: 'visible',

    '& > :first-child': {
      width: ComponentWidths[sidebarComponent].default,
      height:
        sidebarComponent === 'publishing' ? undefined : 'calc(100vh - 80px)',
    },

    [smallScreenQuery]: {
      display: 'none',
    },

    [tabletScreenQuery]:
      position === 'right'
        ? {
            position: 'absolute',
            background: cssVar('backgroundMain'),
            ...(ComponentWidths[sidebarComponent].tablet && {
              width: ComponentWidths[sidebarComponent].tablet,
            }),

            border: `solid 1px ${cssVar('borderDefault')}`,
            borderRight: 'none',
            boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
            padding: 0,
          }
        : {
            display: 'none',
          },

    ...(position === 'left' && {
      order: -1,
      borderRight: 'none',
    }),
  })
);
