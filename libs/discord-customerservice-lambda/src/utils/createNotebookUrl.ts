import { app } from '@decipad/backend-config';
import { PadRecord } from '@decipad/backendtypes';

export const createNotebookUrl = (notebook: PadRecord): string => {
  return `${app().urlBase}/n/${encodeURIComponent(notebook.id)}`;
};
