import { tables } from '@decipad/tables';
import { forbidden, notFound } from '@hapi/boom';

export const fetchNotebook = async (notebookId: string) => {
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound(`notebook with id ${notebookId} not found`);
  }

  if (!notebook.isPublicWritable) {
    throw forbidden('Needs authentication');
  }

  return notebook;
};
