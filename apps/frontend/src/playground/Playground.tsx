import { isServerSideRendering } from '@decipad/support';
import {
  EditorIcon,
  EditorPlaceholder,
  GlobalThemeStyles,
  NotebookPage,
  PlaygroundTopBar,
  useSetCssVarWidth,
} from '@decipad/ui';
import { ComponentProps, useState } from 'react';
import { lazyLoad } from '@decipad/react-utils';
import { Frame } from '../meta';
import { useAnimateMutations } from '../notebooks/notebook/hooks/useAnimateMutations';
import { AnnotationsContext } from '@decipad/react-contexts';

const loadEditor = () =>
  import(/* webpackChunkName: "playground-editor" */ './Editor');
const Editor = lazyLoad(loadEditor);

const Playground: React.FC = () => {
  const [icon, setIcon] =
    useState<ComponentProps<typeof EditorIcon>['icon']>('Deci');
  const [iconColor, setIconColor] =
    useState<ComponentProps<typeof EditorIcon>['color']>('Catskill');

  useAnimateMutations();

  const articleRef = useSetCssVarWidth('editorWidth');

  return (
    <AnnotationsContext.Provider
      value={{
        annotations: undefined,
        articleRef,
        scenarioId: null,
        expandedBlockId: null,
        setExpandedBlockId: () => {},
      }}
    >
      <NotebookPage
        topbar={<PlaygroundTopBar />}
        notebook={
          <div data-editorloaded data-hydrated={!isServerSideRendering()}>
            <Frame
              Heading="h1"
              title={null}
              suspenseFallback={<EditorPlaceholder />}
            >
              <GlobalThemeStyles color={iconColor} />
              <EditorIcon
                icon={icon}
                color={iconColor}
                onChangeIcon={setIcon}
                onChangeColor={setIconColor}
              />
              <Editor />
            </Frame>
          </div>
        }
        articleRef={articleRef}
        sidebar={null}
        tabs={null}
        isEmbed={false}
        isReadOnly={false}
      />
    </AnnotationsContext.Provider>
  );
};
export default Playground;
