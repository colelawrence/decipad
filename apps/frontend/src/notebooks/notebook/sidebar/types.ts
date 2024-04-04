import type { DocSyncEditor } from '@decipad/docsync';
import type { MyEditor } from '@decipad/editor-types';

export interface SidebarComponentProps {
  readonly notebookId: string;
  readonly docsync: DocSyncEditor | undefined;
  readonly editor: MyEditor;
}
