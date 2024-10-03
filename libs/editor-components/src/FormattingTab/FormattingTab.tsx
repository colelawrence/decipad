import { NotebookFormatting } from './NotebookFormatting';
import { MyEditor } from '@decipad/editor-types';
import { useFormattingTabForm } from './useFormattingTabForm';

export interface FormattingTabProps {
  editor: MyEditor;
}

export const FormattingTab = ({ editor }: FormattingTabProps) => {
  const form = useFormattingTabForm(editor);

  // Default to NotebookFormatting if no other form is visible
  return form ?? <NotebookFormatting />;
};
