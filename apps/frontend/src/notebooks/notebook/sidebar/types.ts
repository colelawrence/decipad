import type { DocSyncEditor } from '@decipad/docsync';
import type { MyEditor } from '@decipad/editor-types';
import { ReactElement } from 'react';

export interface SidebarComponentProps {
  readonly notebookId: string;
  readonly workspaceId?: string;
  readonly docsync: DocSyncEditor | undefined;
  readonly editor: MyEditor;
  readonly formattingTabForm: ReactElement | null;
}
