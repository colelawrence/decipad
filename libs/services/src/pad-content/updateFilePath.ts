export const updateFilePath = (notebookId: string, seq: string) =>
  `${encodeURIComponent(notebookId)}/updates/${encodeURIComponent(seq)}`;
