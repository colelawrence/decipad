/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode, useEffect, useRef } from 'react';
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

const layoutAppContainerStyles = css(
  {
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  !isE2E && { height: '100vh' }
);

const layoutEditorAndSidebarContainerStyles = css(
  {
    order: 2,

    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: cssVar('highlightColor'),

    [smallScreenQuery]: {
      paddingTop: 0,
      paddingBottom: 65,
    },
  },
  !isE2E && { height: '100vh' }
);

const layoutHeaderContainerStyles = css({
  width: '100%',
  position: 'sticky',
  padding: '0 32px',
  backgroundColor: cssVar('highlightColor'),
});

const layoutNotebookFixedHeightContainerStyles = css(
  {
    borderRadius: 16,
    backgroundColor: cssVar('backgroundColor'),
  },
  !isE2E && { height: 'calc(100vh - 75px)' }
);

const layoutNotebookScrollerStyles = css(
  {
    overflowX: 'hidden',
    width: '100%',
    paddingBottom: '200px',
    paddingTop: 64,
  },
  !isE2E && { height: '100%' },
  deciOverflowYStyles
);

const layoutArticleWrapperStyles = css({
  margin: '0 24px',
  width: '100%',
  [smallScreenQuery]: {
    backgroundColor: cssVar('backgroundColor'),
    margin: 0,
    padding: '0 24px',
    borderRadius: 16,
  },
});

const layoutAsideStyles = css(
  {
    display: 'flex',
    justifyContent: 'flex-end',
    overflowY: 'auto',
    minWidth: 0,
    transition: `min-width ${shortAnimationDuration} ease-in-out, padding 0ms linear ${shortAnimationDuration}`,
  },
  layoutNotebookFixedHeightContainerStyles,
  isE2E && { height: 'unset' },
  { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
);

interface NotebookPageProps {
  readonly notebookIcon: ReactNode;
  readonly notebook: ReactNode;
  readonly topbar?: ReactNode;
  readonly sidebar?: ReactNode;
  readonly sidebarOpen: boolean;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({
  topbar,
  notebookIcon,
  notebook,
  sidebar,
  sidebarOpen,
}) => {
  const scrollToRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash && scrollToRef.current) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', ' ');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div css={layoutAppContainerStyles}>
      <main css={layoutEditorAndSidebarContainerStyles} ref={scrollToRef}>
        <div css={layoutArticleWrapperStyles}>
          <article css={layoutNotebookFixedHeightContainerStyles}>
            <div css={layoutNotebookScrollerStyles}>
              {notebookIcon}
              {notebook}
            </div>
          </article>
        </div>

        {sidebar && (
          <aside
            css={[
              layoutAsideStyles,
              sidebarOpen && {
                minWidth: 300,
              },
              {
                [smallScreenQuery]: {
                  display: 'none',
                },
                [tabletScreenQuery]: {
                  position: 'fixed',
                  border: `solid 1px ${cssVar('aiPanelBorderColor')}`,
                  boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
                  zIndex: 9,
                },
              },
            ]}
          >
            {sidebar}
          </aside>
        )}
      </main>
      {topbar && <header css={layoutHeaderContainerStyles}>{topbar}</header>}
    </div>
  );
};
