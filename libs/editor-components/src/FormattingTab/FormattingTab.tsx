import {
  NotebookFormatting,
  NotebookFormattingProps,
} from './NotebookFormatting';
import { MyEditor } from '@decipad/editor-types';
import { useFormattingTabForm } from './useFormattingTabForm';

export interface FormattingTabProps extends NotebookFormattingProps {
  editor: MyEditor;
}

export const FormattingTab = ({
  editor,
  ...notebookFormattingProps
}: FormattingTabProps) => {
  const form = useFormattingTabForm(editor);

  // Default to NotebookFormatting if no other form is visible
  return form ?? <NotebookFormatting {...notebookFormattingProps} />;
};
