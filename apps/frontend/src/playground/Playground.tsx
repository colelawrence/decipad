import {
  EditorPlaceholder,
  NotebookIconPlaceholder,
  NotebookPage,
} from '@decipad/ui';
import { ComponentProps, lazy, useState } from 'react';
import { Frame } from '../meta';
import { useAnimateMutations } from '../notebooks/notebook/hooks/useAnimateMutations';

const loadEditor = () =>
  import(/* webpackChunkName: "playground-editor" */ './Editor');
const Editor = lazy(loadEditor);
const loadEditorIcon = () =>
  import(/* webpackChunkName: "playground-editor-icon" */ './EditorIcon');
const EditorIcon = lazy(loadEditorIcon);

// prefetch
loadEditorIcon().then(loadEditor);

const Playground: React.FC = () => {
  const [icon, setIcon] =
    useState<ComponentProps<typeof EditorIcon>['icon']>('Rocket');
  const [iconColor, setIconColor] =
    useState<ComponentProps<typeof EditorIcon>['color']>('Catskill');

  useAnimateMutations();

  return (
    <NotebookPage
      notebook={
        <Frame
          Heading="h1"
          title={null}
          suspenseFallback={<EditorPlaceholder />}
        >
          <Editor />
        </Frame>
      }
      notebookIcon={
        <Frame
          Heading="h1"
          title={null}
          suspenseFallback={<NotebookIconPlaceholder />}
        >
          <EditorIcon
            icon={icon}
            onChangeIcon={setIcon}
            color={iconColor}
            onChangeColor={setIconColor}
          />
        </Frame>
      }
    />
  );
};
export default Playground;
