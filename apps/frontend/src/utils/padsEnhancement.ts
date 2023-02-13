import { exportNotebook, exportNotebookBackups } from './exportNotebook';
import { parseIconColorFromIdentifier } from './parseIconColorFromIdentifier';

export const makeIcons = (notebook: any) => {
  const { icon = 'Rocket', iconColor = 'Catskill' } =
    parseIconColorFromIdentifier(notebook?.icon);
  const status: string = notebook?.status || 'draft';
  return {
    ...notebook,
    icon,
    iconColor,
    status,
    onExport: exportNotebook(notebook.id),
    onExportBackups: exportNotebookBackups(notebook.id),
    creationDate: new Date(notebook.createdAt),
  };
};

export const filterPads =
  ({ page }: { page: 'archived' | 'shared' | 'workspace' | 'section' }) =>
  (notebook: any) => {
    const archived = page === 'archived';

    return (
      (!archived ? notebook.archived !== true : true) &&
      (archived ? notebook.archived === true : true)
    );
  };
