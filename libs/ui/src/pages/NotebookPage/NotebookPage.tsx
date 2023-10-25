import { ReactNode } from 'react';
import {
  useDraggingScroll,
  useScrollToHash,
  useSetCssVarWidth,
} from '../../hooks';
import { useNotebookMetaData } from '@decipad/react-contexts';
import * as S from './styles';
import { isFlagEnabled } from '@decipad/feature-flags';

interface NotebookPageProps {
  readonly notebook: ReactNode;
  readonly topbar: ReactNode;
  readonly sidebar: ReactNode;
  readonly tabs: ReactNode;
  readonly assistant: ReactNode;
  readonly isEmbed: boolean;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({
  topbar,
  notebook,
  sidebar,
  tabs,
  assistant,
  isEmbed = false,
}) => {
  const [sidebarOpen, assistantOpen] = useNotebookMetaData((state) => [
    state.sidebarOpen,
    state.aiMode,
  ]);

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
          isAssistantOpen={assistantOpen}
          isSidebarOpen={sidebarOpen && !isEmbed}
          ref={articleRef}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <S.NotebookSpacingWrapper ref={overflowingDiv}>
            {notebook}
          </S.NotebookSpacingWrapper>
          {!isEmbed && tabs}
        </S.ArticleWrapper>

        {!isEmbed && (!!sidebar || !!assistant) && (
          <S.AsideWrapper
            isSidebarOpen={sidebarOpen}
            isAssistantOpen={assistantOpen}
          >
            <>
              {sidebar}
              {isFlagEnabled('AI_ASSISTANT_CHAT') ? assistant : null}
            </>
          </S.AsideWrapper>
        )}
      </S.MainWrapper>
    </S.AppWrapper>
  );
};
