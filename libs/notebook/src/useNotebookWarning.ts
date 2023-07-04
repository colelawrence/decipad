import { useToast } from '@decipad/toast';
import { useEffect, useState } from 'react';
import { useNotebookState } from '@decipad/notebook-state';
import { useSession } from 'next-auth/react';

interface UseNotebookWarningProps {
  notebookId: string;
}

export const useNotebookWarning = ({ notebookId }: UseNotebookWarningProps) => {
  const toast = useToast();
  const { data: session } = useSession();

  const { editor, hasLocalChanges } = useNotebookState(notebookId);

  const warning: string | false =
    editor != null &&
    (editor.isReadOnly || false) &&
    `Changes to this notebook are not saved${
      (session?.user &&
        '. Please duplicate to customize and make it your own.') ||
      ''
    }`;
  const [toastedWarning, setToastedWarning] = useState(false);

  useEffect(() => {
    if (warning && hasLocalChanges && !toastedWarning) {
      setToastedWarning(true);
      toast(warning as string, 'warning', { autoDismiss: false });
    }
  }, [editor, hasLocalChanges, toast, toastedWarning, warning]);
};
