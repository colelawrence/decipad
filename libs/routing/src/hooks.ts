import { useRouteParams } from 'typesafe-routes/react-router';
import notebooks from './notebooks';

const NO_DOCSYNC_EDITOR_ID = 'no-docsync-editor-id';

/**
 * Extended version of the notebook route params.
 *
 * It provides a more convinient way, instead of importing a bunch of stuff,
 * and doing a lot of object destructuring.
 *
 * @note only use when inside the notebook.
 */
export const useNotebookRoute = () => {
  const notebookParams = useRouteParams(notebooks({}).notebook);

  return {
    ...notebookParams,
    isEmbed: Boolean(notebookParams.embed),
    notebookName: notebookParams.notebook?.name,

    notebookId: notebookParams.notebook?.id ?? NO_DOCSYNC_EDITOR_ID,
    aliasId: notebookParams.alias,
    scenarioId: notebookParams.scenario,
    tabId: notebookParams.tab,
  };
};
