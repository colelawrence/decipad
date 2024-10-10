import { EditorSidebar as EditorComponentSidebar } from '@decipad/editor-components';
import { EditorController } from '@decipad/notebook-tabs';
import { useMemo, type FC } from 'react';
import type { SidebarComponentProps } from './types';
import { useNotebookStateAndActions } from '../hooks';

const EditorSidebar: FC<SidebarComponentProps> = (props) => {
  const actions = useNotebookStateAndActions({
    notebookId: props.notebookId,
    docsync: props.docsync,
  });

  const formattingTabProps = useMemo(
    () => ({
      numberFormatting: actions.numberFormatting,
      setNumberFormatting: actions.setNumberFormatting,
    }),
    [actions.numberFormatting, actions.setNumberFormatting]
  );

  if (props.docsync == null) {
    return null;
  }

  return (
    <EditorComponentSidebar
      {...props}
      controller={props.docsync as unknown as EditorController}
      formattingTabProps={formattingTabProps}
    />
  );
};

export default EditorSidebar;
