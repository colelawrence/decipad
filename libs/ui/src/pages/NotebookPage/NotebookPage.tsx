/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ComponentProps, ReactNode, useEffect, useRef, useState } from 'react';
import { useDraggingScroll } from '../../hooks';
import {
  cssVar,
  cssVarName,
  mediumShadow,
  setCssVar,
  shortAnimationDuration,
  smallScreenQuery,
  tabletScreenQuery,
} from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { EditorIcon } from '../../templates';
import { useNotebookMetaData } from '@decipad/react-contexts';

// needed for screenshot testing
const isE2E = 'navigator' in globalThis && navigator.webdriver;

const layoutAppContainerHeightStyles = (isEmbed: boolean) =>
  !isE2E && {
    border: isEmbed ? `1px solid ${cssVar('borderDefault')}` : 0,
  };

const layoutAppContainerStyles = css({
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const layoutEditorAndSidebarContainerStyles = (isEmbed: boolean) => [
  {
    order: isEmbed ? 1 : 2,

    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: cssVar('backgroundAccent'),

    [smallScreenQuery]: {
      paddingTop: 0,
      paddingBottom: isEmbed ? 0 : 65,
    },
  },
  !isE2E && { height: isEmbed ? 'fit-content' : '100%' },
];

const layoutHeaderContainerStyles = (isEmbed: boolean) =>
  css({
    height: '76px',
    width: '100%',
    position: 'sticky',
    order: isEmbed ? 2 : 1,
    padding: isEmbed ? '0 8px' : '0 32px',
    backgroundColor: cssVar('backgroundAccent'),
    display: 'flex',
    alignItems: 'center',
  });

const layoutNotebookFixedHeightContainerStyles = (isEmbed: boolean) => [
  {
    backgroundColor: cssVar('backgroundMain'),
    height: '100%',
  },
  css(
    isEmbed
      ? { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }
      : {
          borderRadius: 16,
        }
  ),
];

const layoutNotebookSpacingStyles = (isEmbed: boolean) => [
  {
    [smallScreenQuery]: {
      padding: '12px 24px',
    },
  },
  isEmbed
    ? { paddingTop: 32, paddingBottom: 32 }
    : { paddingTop: 64, paddingBottom: '200px' },
];

const layoutNotebookScrollerStyles = css([
  {
    overflowX: 'hidden',
    width: '100%',
  },
  !isE2E && { height: '100%' },
  deciOverflowYStyles,
]);

const layoutArticleWrapperStyles = (isEmbed: boolean) =>
  css({
    margin: isEmbed ? '0' : '0 24px 24px 24px',
    width: '100%',
    [smallScreenQuery]: {
      backgroundColor: cssVar('backgroundMain'),
      margin: 0,
      ...(isEmbed
        ? { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }
        : {
            borderRadius: 16,
          }),
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
  layoutNotebookFixedHeightContainerStyles(false),
  isE2E && { height: 'unset' },
  { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
);

interface NotebookPageProps {
  readonly notebook: ReactNode;
  readonly topbar?: ReactNode;
  readonly sidebar?: ReactNode;
  readonly isEmbed?: boolean;

  // Icon stuff
  readonly icon: ComponentProps<typeof EditorIcon>['icon'] | undefined;
  readonly iconColor: ComponentProps<typeof EditorIcon>['color'];

  readonly onUpdateIcon: (
    icon: ComponentProps<typeof EditorIcon>['icon']
  ) => void;
  readonly onUpdateIconColor: (
    color: ComponentProps<typeof EditorIcon>['color']
  ) => void;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({
  topbar,
  notebook,
  sidebar,

  icon = 'Deci',
  isEmbed = false,
  iconColor,
  onUpdateIcon,
  onUpdateIconColor,
}) => {
  const { sidebarOpen } = useNotebookMetaData((s) => ({
    sidebarOpen: s.sidebarOpen,
  }));

  const scrollToRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash && scrollToRef.current) {
        const elementId = hash.replace('#', '');
        // React element IDs do not follow the standard CSS selector naming rules, so we can't simply use querySelector(#<something>)
        const targetElement = document.querySelector(`[id="${elementId}"]`);
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

  const [editorWidth, setEditorWidth] = useState(
    setCssVar('editorWidth', '100vw')
  );
  useEffect(() => {
    // const refWidth = articleRef.current?.offsetWidth;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const refWidth = entry.contentRect.width;
        setEditorWidth(setCssVar('editorWidth', `${refWidth.toString()}px`));
        const root = document.documentElement;
        root.style.setProperty(cssVarName('editorWidth'), `${refWidth}px`);
      }
    });

    if (articleRef.current) {
      resizeObserver.observe(articleRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const overflowingDiv = useRef<HTMLDivElement>(null);
  const { onDragEnd, onDragOver } = useDraggingScroll(overflowingDiv);

  return (
    <div
      css={[layoutAppContainerStyles, layoutAppContainerHeightStyles(isEmbed)]}
    >
      <main
        css={layoutEditorAndSidebarContainerStyles(isEmbed)}
        ref={scrollToRef}
      >
        <div css={layoutArticleWrapperStyles(isEmbed)}>
          <article
            ref={articleRef}
            css={layoutNotebookFixedHeightContainerStyles(isEmbed)}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
          >
            <div
              css={[
                layoutNotebookSpacingStyles(isEmbed),
                layoutNotebookScrollerStyles,
                editorWidth,
              ]}
              ref={overflowingDiv}
            >
              {!isEmbed && (
                <EditorIcon
                  icon={icon}
                  color={iconColor}
                  onChangeColor={onUpdateIconColor}
                  onChangeIcon={onUpdateIcon}
                />
              )}
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
                  border: `solid 1px ${cssVar('borderDefault')}`,
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
      {topbar && (
        <header css={layoutHeaderContainerStyles(isEmbed)}>{topbar}</header>
      )}
    </div>
  );
};
