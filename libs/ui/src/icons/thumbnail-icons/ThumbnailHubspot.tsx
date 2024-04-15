import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailHubspotLight, ThumbnailHubspotDark } from './themed';

export const ThumbnailHubspot = () => (
  <ThumbnailIcon
    light={<ThumbnailHubspotLight />}
    dark={<ThumbnailHubspotDark />}
  />
);
