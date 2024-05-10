import { ReactNode } from 'react';
import {
  useArticleContentRect,
  useDraggingScroll,
  useScrollToHash,
} from '../../hooks';
import { SidebarComponent, useNotebookMetaData } from '@decipad/react-contexts';
import * as S from './styles';
import { PermissionType } from '../../types';

interface NotebookPageProps {
  readonly notebook: ReactNode;
  readonly topbar: ReactNode;
  readonly sidebar: ReactNode;
  readonly tabs: ReactNode;
  readonly isEmbed: boolean;
  // Undefined means we haven't loaded yet
  readonly isReadOnly: boolean | undefined;
  readonly permission?: PermissionType | null | undefined;
  readonly articleRef: React.RefObject<HTMLElement>;
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
  const {
    topbar,
    notebook,
    sidebar,
    tabs,
    isEmbed = false,
    articleRef,
  } = props;

  const [sidebarComponent] = useNotebookMetaData((state) => [
    state.sidebarComponent,
  ]);

  const scrollToRef = useScrollToHash();
  const {
    ref: overflowingDiv,
    onDragEnd,
    onDragOver,
  } = useDraggingScroll<HTMLDivElement>();

  const showSidebar = getShowSidebar(props, sidebarComponent);
  const articleContentRect = useArticleContentRect();

  return (
    <S.AppWrapper isEmbed={isEmbed}>
      {topbar && <header>{topbar}</header>}

      <S.MainWrapper isEmbed={isEmbed} hasTabs={!!tabs} ref={scrollToRef}>
        <S.ArticleWrapper
          isEmbed={isEmbed}
          ref={articleRef}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <S.NotebookSpacingWrapper
            ref={overflowingDiv}
            id="overflowing-editor"
          >
            <S.BorderRadiusWrapper
              position="left"
              offset={articleContentRect?.left}
            />
            <S.BorderRadiusWrapper
              position="right"
              offset={
                articleContentRect
                  ? articleContentRect.width + articleContentRect.left - 16
                  : undefined
              }
            />
            {notebook}
          </S.NotebookSpacingWrapper>
          {tabs}
        </S.ArticleWrapper>
        {showSidebar && (
          <S.AsideWrapper sidebarComponent={sidebarComponent}>
            {sidebar}
          </S.AsideWrapper>
        )}
      </S.MainWrapper>
    </S.AppWrapper>
  );
};
