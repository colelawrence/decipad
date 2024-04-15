import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailCodeLight, ThumbnailCodeDark } from './themed';

export const ThumbnailCode = () => (
  <ThumbnailIcon light={<ThumbnailCodeLight />} dark={<ThumbnailCodeDark />} />
);
