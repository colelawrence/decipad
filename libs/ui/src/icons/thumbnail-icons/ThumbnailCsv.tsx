import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailCsvDark, ThumbnailCsvLight } from './themed';

export const ThumbnailCsv = () => (
  <ThumbnailIcon light={<ThumbnailCsvLight />} dark={<ThumbnailCsvDark />} />
);
