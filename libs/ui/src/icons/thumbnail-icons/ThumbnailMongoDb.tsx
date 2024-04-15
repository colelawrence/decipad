import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailMongoDbLight, ThumbnailMongoDbDark } from './themed';

export const ThumbnailMongoDb = () => (
  <ThumbnailIcon
    light={<ThumbnailMongoDbLight />}
    dark={<ThumbnailMongoDbDark />}
  />
);
