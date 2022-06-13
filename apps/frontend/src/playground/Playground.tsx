import { NoDocSyncEditor } from '@decipad/editor';
import { EditorIcon, NotebookPage } from '@decipad/ui';
import { useState, ComponentProps } from 'react';

const Playground: React.FC = () => {
  const [icon, setIcon] =
    useState<ComponentProps<typeof EditorIcon>['icon']>('Rocket');
  const [iconColor, setIconColor] =
    useState<ComponentProps<typeof EditorIcon>['color']>('Catskill');

  return (
    <NotebookPage
      notebook={<NoDocSyncEditor />}
      notebookIcon={
        <EditorIcon
          icon={icon}
          onChangeIcon={setIcon}
          color={iconColor}
          onChangeColor={setIconColor}
        />
      }
    />
  );
};
export default Playground;
