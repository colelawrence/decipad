import { NoDocSyncEditor } from '@decipad/editor';
import { EditorIcon, NotebookPage } from '@decipad/ui';
import { ComponentProps, FC, useEffect, useState } from 'react';

export function PlaygroundRoute(): ReturnType<FC> {
  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  const [icon, setIcon] =
    useState<ComponentProps<typeof EditorIcon>['icon']>('Rocket');
  const [iconColor, setIconColor] =
    useState<ComponentProps<typeof EditorIcon>['color']>('Catskill');

  return (
    <NotebookPage
      notebook={<NoDocSyncEditor />}
      notebookIcon={
        <EditorIcon
          readOnly
          icon={icon}
          onChangeIcon={setIcon}
          color={iconColor}
          onChangeColor={setIconColor}
        />
      }
    />
  );
}
