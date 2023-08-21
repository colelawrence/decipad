import { isServerSideRendering } from '@decipad/support';
import {
  EditorIcon,
  EditorPlaceholder,
  NotebookPage,
  PlaygroundTopBar,
} from '@decipad/ui';
import { ComponentProps, useState } from 'react';
import { lazyLoad } from '@decipad/react-utils';
import { Frame } from '../meta';
import { useAnimateMutations } from '../notebooks/notebook/hooks/useAnimateMutations';

const loadEditor = () =>
  import(/* webpackChunkName: "playground-editor" */ './Editor');
const Editor = lazyLoad(loadEditor);

const Playground: React.FC = () => {
  const [icon, setIcon] =
    useState<ComponentProps<typeof EditorIcon>['icon']>('Deci');
  const [iconColor, setIconColor] =
    useState<ComponentProps<typeof EditorIcon>['color']>('Catskill');

  useAnimateMutations();

  return (
    <NotebookPage
      topbar={<PlaygroundTopBar />}
      notebook={
        <div data-editorloaded data-hydrated={!isServerSideRendering()}>
          <Frame
            Heading="h1"
            title={null}
            suspenseFallback={<EditorPlaceholder />}
          >
            <Editor />
          </Frame>
        </div>
      }
      icon={icon}
      iconColor={iconColor}
      onUpdateIcon={setIcon}
      onUpdateIconColor={setIconColor}
    />
  );
};
export default Playground;
