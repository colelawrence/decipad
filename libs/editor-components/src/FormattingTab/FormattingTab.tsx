import { ReactElement } from 'react';
import { NotebookFormatting } from './NotebookFormatting';

export interface FormattingTabProps {
  form: ReactElement | null;
}

export const FormattingTab = ({ form }: FormattingTabProps) => {
  // Default to NotebookFormatting if no other form is visible
  return form ?? <NotebookFormatting />;
};
