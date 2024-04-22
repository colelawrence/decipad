import styled from '@emotion/styled';
import { css } from '@emotion/react';
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

export const SIDEBAR_WIDTH = '320px';
const ASSISTANT_WIDTH = '640px';
const HEADER_HEIGHT = '64px';

/**
 * Used to wrap everything inside the app.
 */
export const AppWrapper = styled.div<{ isEmbed: boolean }>((props) => ({
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  ...(!isE2E &&
    props.isEmbed && {
      border: `1px solid ${cssVar('borderDefault')}`,
    }),

  /* E2E */
  ...(isE2E && {
    height: 'unset',
  }),

  '& > header': {
    position: 'fixed',
    height: HEADER_HEIGHT,
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
    marginTop: HEADER_HEIGHT,
    [tabletScreenQuery]: {
      gap: 0,
    },
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

const ComponentWidths: Record<
  SidebarComponent,
  { default: string; tablet?: string; mobile?: string }
> = {
  'default-sidebar': { default: SIDEBAR_WIDTH },
  publishing: { default: SIDEBAR_WIDTH },
  ai: { default: ASSISTANT_WIDTH },
  closed: { default: '0px' },
  annotations: { default: SIDEBAR_WIDTH, tablet: '0px' },
};

export const ArticleWrapper = styled.article<ArticleWrapperProps>((props) => ({
  position: 'relative',
  minWidth: '0px',
  // min-width: 0 is very important
  // See: https://stackoverflow.com/questions/30861247/flexbox-children-does-not-respect-height-of-parent-with-flex-direction-column
  backgroundColor: cssVar('backgroundMain'),
  paddingBottom: '56px',
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

type Position = 'left' | 'right';

export const BorderRadiusWrapper = styled.div<{
  position: Position;
  offset?: number;
}>`
  display: ${({ offset }) => (offset === null ? 'none' : 'block')};
  background-color: ${cssVar('backgroundAccent')};
  width: 16px;
  height: 16px;
  position: fixed;
  top: ${HEADER_HEIGHT};
  ${({ position, offset }) =>
    position === 'left'
      ? css`
          left: ${offset}px;
          &:before {
            border-top-left-radius: 16px;
          }
        `
      : css`
          left: ${offset}px;
          &:before {
            border-top-right-radius: 16px;
          }
        `}
  &:before {
    display: block;
    content: '';
    background-color: ${cssVar('backgroundMain')};
    width: 16px;
    height: 16px;
    z-index: 1;
  }
`;

interface AsideWrapperProps {
  readonly sidebarComponent: SidebarComponent;
}

export const AsideWrapper = styled.aside<AsideWrapperProps>((props) => {
  return {
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-end',
    overflowY: 'auto',
    flexShrink: 0,
    width: ComponentWidths[props.sidebarComponent].default,
    height: 'calc(100% - 12px)',
    borderRadius: '16px',
    zIndex: 40,
    overflow: 'visible',
    '& > :first-child': css({
      maxHeight: 'calc(100vh - 80px)',
      position: props.sidebarComponent === 'annotations' ? 'static' : 'fixed',
      width: ComponentWidths[props.sidebarComponent].default,
      height: props.sidebarComponent === 'publishing' ? 'auto' : '100%',
    }),
    [smallScreenQuery]: {
      display: 'none',
    },
    [tabletScreenQuery]: {
      background: cssVar('backgroundMain'),
      position: props.sidebarComponent === 'annotations' ? 'static' : 'fixed',
      ...(ComponentWidths[props.sidebarComponent].tablet && {
        width: ComponentWidths[props.sidebarComponent].tablet,
      }),
      '& > :first-child': {
        position: 'static',
      },

      height:
        props.sidebarComponent === 'publishing' ||
        props.sidebarComponent === 'annotations'
          ? 'fit-content'
          : 'calc(100vh - 80px)',
      border: `solid 1px ${cssVar('borderDefault')}`,
      borderRight: 'none',
      boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
      padding: 0,
    },
  };
});
