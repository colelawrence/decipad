import { notebooks, useRouteParams } from '@decipad/routing';

export const useNotebookRouterId = (): string => {
  const {
    notebook: { id: notebookId },
  } = useRouteParams(notebooks({}).notebook);

  return notebookId;
};

export const useIsEmbed = (): boolean => {
  const { embed: _embed } = useRouteParams(notebooks({}).notebook);

  return Boolean(_embed);
};
