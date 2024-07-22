/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode } from 'react';
import { useDraggingScroll, useScrollToHash } from '../../hooks';
import { SidebarComponent, useNotebookMetaData } from '@decipad/react-contexts';
import * as S from './styles';
import { PermissionType } from '../../types';
import { IN_EDITOR_SIDEBAR_ID, OVERFLOWING_EDITOR_ID } from '../../constants';

interface NotebookPageProps {
  readonly notebook: ReactNode;
  readonly topbar: ReactNode;
  readonly sidebar: ReactNode;
  readonly tabs: ReactNode;
  readonly isEmbed: boolean;

  // Undefined means we haven't loaded yet
  readonly isReadOnly: boolean | undefined;
  readonly permission?: PermissionType | null | undefined;
}

const ALLOWED_READER_SIDEBAR_COMPONENTS: SidebarComponent[] = ['annotations'];

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
    !ALLOWED_READER_SIDEBAR_COMPONENTS.includes(sidebarComponent)
  )
    return false;

  if (sidebarComponent === 'closed') return false;

  return true;
}

export const NotebookPage: React.FC<NotebookPageProps> = (props) => {
  const { topbar, notebook, sidebar, tabs, isEmbed = false } = props;

  const sidebarComponent = useNotebookMetaData(
    (state) => state.sidebarComponent
  );

  const scrollToRef = useScrollToHash();
  const {
    ref: overflowingDiv,
    onDragEnd,
    onDragOver,
  } = useDraggingScroll<HTMLDivElement>();

  const showSidebar = getShowSidebar(props, sidebarComponent);
  const isInEditorSidebar = sidebarComponent === 'annotations';

  return (
    <S.AppWrapper isEmbed={isEmbed}>
      {topbar && <header>{topbar}</header>}

      <S.MainWrapper
        isEmbed={isEmbed}
        hasTabs={!!tabs}
        ref={scrollToRef}
        isInEditorSidebar={isInEditorSidebar}
      >
        <S.ArticleWrapper
          isEmbed={isEmbed}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <S.EditorAndTabWrapper>
            <S.NotebookSpacingWrapper
              ref={overflowingDiv}
              id="overflowing-editor"
            >
              {!isInEditorSidebar && <SketchyTopRightEditorCorner />}
              <S.OverflowingEditor id={OVERFLOWING_EDITOR_ID}>
                <S.PaddingEditor>
                  {isInEditorSidebar && <SketchyTopRightEditorCorner />}
                  {notebook}
                </S.PaddingEditor>
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
        </S.ArticleWrapper>
        <SidebarExtra
          showSidebar={showSidebar}
          sidebarComponent={sidebarComponent}
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
  children: ReactNode;
}> = ({ showSidebar, sidebarComponent, children }) => {
  if (!showSidebar) {
    return null;
  }

  if (sidebarComponent === 'annotations') {
    return <>{children}</>;
  }

  return (
    <S.AsideWrapper sidebarComponent={sidebarComponent}>
      {children}
    </S.AsideWrapper>
  );
};

const SketchyTopRightEditorCorner: FC = () => (
  <S.TopRightWrapper>
    <div>
      <div />
    </div>
  </S.TopRightWrapper>
);
