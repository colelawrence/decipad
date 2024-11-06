/* eslint decipad/css-prop-named-variable: 0 */
import { SidebarComponent, useNotebookMetaData } from '@decipad/react-contexts';
import { shouldRenderComponent } from '@decipad/react-utils';
import React, { FC, ReactNode } from 'react';
import { IN_EDITOR_SIDEBAR_ID, OVERFLOWING_EDITOR_ID } from '../../constants';
import { useDraggingScroll, useScrollToHash } from '../../hooks';
import { PermissionType } from '../../types';
import * as S from './styles';
import { useSetDataDrawerVar } from './hooks';

interface NotebookPageProps {
  readonly notebook: ReactNode;
  readonly topbar: ReactNode;
  readonly sidebar: ReactNode;
  readonly leftSidebar?: ReactNode;
  readonly tabs: ReactNode;
  readonly dataDrawer: ReactNode;

  readonly isEmbed: boolean;
  readonly isReadOnly: boolean | undefined;
  readonly permission?: PermissionType | null | undefined;
  readonly articleRef: React.RefObject<HTMLElement>;
  readonly shouldRenderNavigationSidebar?: boolean;
}

const ALLOWED_READER_SIDEBAR_COMPONENTS: SidebarComponent['type'][] = [
  'annotations',
];

/**
 * Documentation function
 *
 * Serves as a place to check logic for when to and not to show a sidebar
 */
function getShowSidebar(
  props: NotebookPageProps,
  sidebarComponent: SidebarComponent
) {
  if (props.permission == null) return false;

  if (props.isEmbed) return false;
  if (props.sidebar == null) return false;

  if (
    (props.isReadOnly == null || props.isReadOnly) &&
    !ALLOWED_READER_SIDEBAR_COMPONENTS.includes(sidebarComponent.type)
  )
    return false;

  if (sidebarComponent.type === 'closed') return false;

  return true;
}

export const NotebookPage: React.FC<NotebookPageProps> = (props) => {
  const {
    topbar,
    notebook,
    sidebar,
    leftSidebar,
    tabs,
    isEmbed = false,
    articleRef,
    dataDrawer,
    shouldRenderNavigationSidebar = false,
  } = props;

  const sidebarComponent = useNotebookMetaData(
    (state) => state.sidebarComponent
  );

  const scrollToRef = useScrollToHash();
  const {
    ref: overflowingDiv,
    onDragEnd,
    onDragOver,
  } = useDraggingScroll<HTMLDivElement>();

  useSetDataDrawerVar();

  const showSidebar = getShowSidebar(props, sidebarComponent);
  const isInEditorSidebar = sidebarComponent.type === 'annotations';

  return (
    <S.AppWrapper isEmbed={isEmbed}>
      {topbar && <header>{topbar}</header>}
      <S.MainWrapper
        isEmbed={isEmbed}
        hasTabs={!!tabs}
        ref={scrollToRef}
        isInEditorSidebar={isInEditorSidebar}
      >
        {leftSidebar && (
          <SidebarExtra
            isDataDrawerOpen={shouldRenderComponent(dataDrawer)}
            showSidebar={shouldRenderNavigationSidebar}
            sidebarComponent={{ type: 'navigation-sidebar' }}
            position="left"
          >
            {leftSidebar}
          </SidebarExtra>
        )}
        <S.ArticleWrapper
          isEmbed={isEmbed}
          ref={articleRef}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <S.EditorAndTabWrapper>
            <S.NotebookSpacingWrapper
              ref={overflowingDiv}
              id="overflowing-editor"
            >
              <S.OverflowingEditor id={OVERFLOWING_EDITOR_ID}>
                <S.PaddingEditor>{notebook}</S.PaddingEditor>
                <S.InEditorSidebar
                  id={IN_EDITOR_SIDEBAR_ID}
                ></S.InEditorSidebar>
              </S.OverflowingEditor>
            </S.NotebookSpacingWrapper>
            {tabs != null && (
              <S.TabWrapper isInEditorSidebar={isInEditorSidebar}>
                {tabs}
              </S.TabWrapper>
            )}
          </S.EditorAndTabWrapper>
          {shouldRenderComponent(dataDrawer) && (
            <S.DataDrawer isInEditorSidebar={isInEditorSidebar}>
              {dataDrawer}
            </S.DataDrawer>
          )}
        </S.ArticleWrapper>
        <SidebarExtra
          showSidebar={showSidebar}
          sidebarComponent={sidebarComponent}
          isDataDrawerOpen={shouldRenderComponent(dataDrawer)}
        >
          {sidebar}
        </SidebarExtra>
      </S.MainWrapper>
    </S.AppWrapper>
  );
};

const SidebarExtra: FC<{
  showSidebar: boolean;
  sidebarComponent: SidebarComponent;
  isDataDrawerOpen: boolean;
  children: ReactNode;
  position?: 'left' | 'right';
}> = ({
  showSidebar,
  sidebarComponent,
  children,
  position = 'right',
  isDataDrawerOpen,
}) => {
  if (!showSidebar) {
    return null;
  }

  if (sidebarComponent.type === 'annotations') {
    return <>{children}</>;
  }

  return (
    <S.AsideWrapper
      sidebarComponent={sidebarComponent}
      position={position}
      isDataDrawerOpen={isDataDrawerOpen}
    >
      {children}
    </S.AsideWrapper>
  );
};
