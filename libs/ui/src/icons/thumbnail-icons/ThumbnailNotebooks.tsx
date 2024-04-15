import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailNotebooksLight, ThumbnailNotebooksDark } from './themed';

export const ThumbnailNotebooks = () => (
  <ThumbnailIcon
    light={<ThumbnailNotebooksLight />}
    dark={<ThumbnailNotebooksDark />}
  />
);
