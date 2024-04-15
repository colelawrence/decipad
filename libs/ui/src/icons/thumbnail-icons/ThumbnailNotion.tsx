import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailNotionLight, ThumbnailNotionDark } from './themed';

export const ThumbnailNotion = () => (
  <ThumbnailIcon
    light={<ThumbnailNotionLight />}
    dark={<ThumbnailNotionDark />}
  />
);
