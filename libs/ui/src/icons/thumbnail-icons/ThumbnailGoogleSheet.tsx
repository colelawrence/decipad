import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailGoogleSheetLight, ThumbnailGoogleSheetDark } from './themed';

export const ThumbnailGoogleSheet = () => (
  <ThumbnailIcon
    light={<ThumbnailGoogleSheetLight />}
    dark={<ThumbnailGoogleSheetDark />}
  />
);
