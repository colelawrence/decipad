import { DocSyncEditor } from '@decipad/docsync';
import { useActiveEditor } from '@decipad/editor-hooks';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { notebooks } from '@decipad/routing';
import { EditorSidebar } from '@decipad/editor-components';
import { FC } from 'react';
import { useRouteParams } from 'typesafe-routes/react-router';

export interface SidebarProps {
  readonly docsync: DocSyncEditor | undefined;
}

const Sidebar: FC<SidebarProps> = ({ docsync }) => {
  const [isSidebarOpen] = useNotebookMetaData((state) => [state.sidebarOpen]);

  const { embed: _embed } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  const editor = useActiveEditor(docsync);

  if (isSidebarOpen && !isEmbed && editor) {
    return <EditorSidebar editor={editor} />;
  }

  return null;
};

export default Sidebar;
