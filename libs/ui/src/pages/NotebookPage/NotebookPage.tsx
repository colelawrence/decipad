/* eslint decipad/css-prop-named-variable: 0 */
import { ComponentProps, ReactNode } from 'react';
import {
  useDraggingScroll,
  useScrollToHash,
  useSetCssVarWidth,
} from '../../hooks';
import { EditorIcon } from '../../templates';
import { useNotebookMetaData } from '@decipad/react-contexts';
import * as S from './styles';

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
            {!isEmbed && (
              <EditorIcon
                icon={icon}
                color={iconColor}
                onChangeColor={onUpdateIconColor}
                onChangeIcon={onUpdateIcon}
              />
            )}
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
