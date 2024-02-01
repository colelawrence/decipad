import { DocSyncEditor } from '@decipad/docsync';
import { MyEditor } from '@decipad/editor-types';

export interface SidebarComponentProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
  readonly editor: MyEditor;
}
