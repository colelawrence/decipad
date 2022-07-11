import { NotebookPage, atoms } from '@decipad/ui';
import { useState, ComponentProps, lazy } from 'react';
import { Frame } from '../meta';

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

  return (
    <NotebookPage
      notebook={
        <Frame
          Heading="h1"
          title={null}
          suspenseFallback={<atoms.EditorPlaceholder />}
        >
          <Editor />
        </Frame>
      }
      notebookIcon={
        <Frame
          Heading="h1"
          title={null}
          suspenseFallback={<atoms.NotebookIconPlaceholder />}
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
