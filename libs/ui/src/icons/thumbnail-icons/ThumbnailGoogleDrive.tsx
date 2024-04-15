import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailGoogleDriveLight, ThumbnailGoogleDriveDark } from './themed';

export const ThumbnailGoogleDrive = () => (
  <ThumbnailIcon
    light={<ThumbnailGoogleDriveLight />}
    dark={<ThumbnailGoogleDriveDark />}
  />
);
