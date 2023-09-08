import { ReactNode } from 'react';
import {
  useDraggingScroll,
  useScrollToHash,
  useSetCssVarWidth,
} from '../../hooks';
import { useNotebookMetaData } from '@decipad/react-contexts';
import * as S from './styles';

interface NotebookPageProps {
  readonly notebook: ReactNode;
  readonly topbar: ReactNode;
  readonly sidebar: ReactNode;
  readonly isEmbed: boolean;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({
  topbar,
  notebook,
  sidebar,

  isEmbed = false,
}) => {
  const { sidebarOpen } = useNotebookMetaData((s) => ({
    sidebarOpen: s.sidebarOpen,
  }));
  const scrollToRef = useScrollToHash();
  const {
    ref: overflowingDiv,
    onDragEnd,
    onDragOver,
  } = useDraggingScroll<HTMLDivElement>();
  const articleRef = useSetCssVarWidth('editorWidth');

  return (
    <S.AppWrapper isEmbed={isEmbed}>
      {topbar && <header>{topbar}</header>}

      <S.MainWrapper isEmbed={isEmbed} ref={scrollToRef}>
        <S.ArticleWrapper
          isEmbed={isEmbed}
          ref={articleRef}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <S.NotebookSpacingWrapper ref={overflowingDiv}>
            {notebook}
          </S.NotebookSpacingWrapper>
        </S.ArticleWrapper>

        {sidebar && (
          <S.AsideWrapper isOpen={sidebarOpen}>{sidebar}</S.AsideWrapper>
        )}
      </S.MainWrapper>
    </S.AppWrapper>
  );
};
