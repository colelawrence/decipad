const baseUrl =
  'window' in global && 'location' in window
    ? window.location.origin
    : process.env.DECI_APP_URL_BASE || 'http://localhost:3000';

export const BackendUrl = {
  // NotebookID = EditorID
  fetchProxy(notebookId: string): URL {
    return new URL(`/api/pads/${notebookId}/fetch`, baseUrl);
  },
  pingDatabase(): URL {
    return new URL(`/api/externaldatasources/db/testconn`, baseUrl);
  },
};
