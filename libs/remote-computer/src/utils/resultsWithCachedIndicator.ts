import { NotebookResults } from '@decipad/computer-interfaces';

export const resultsWithCachedIndicator = (
  results: NotebookResults
): NotebookResults => {
  return {
    ...results,
    blockResults: Object.fromEntries(
      Object.entries(results.blockResults).map(([blockId, result]) => [
        blockId,
        { ...result, fromCache: true },
      ])
    ),
  };
};
