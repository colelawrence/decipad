import { tables } from '@decipad/tables';
import { forbidden, notFound } from '@hapi/boom';

export const fetchNotebook = async (notebookId: string) => {
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound(`notebook with id ${notebookId} not found`);
  }

  // TODO: Add authentication here for notebooks without users.

  if (notebook.gist === 'ai') {
    // This is a `gist`, AI should be able to edit it.
    return notebook;
  }

  throw forbidden('Needs authentication');
};
