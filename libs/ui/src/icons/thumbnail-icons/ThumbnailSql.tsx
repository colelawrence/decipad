import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailSqlLight, ThumbnailSqlDark } from './themed';

export const ThumbnailSql = () => (
  <ThumbnailIcon light={<ThumbnailSqlLight />} dark={<ThumbnailSqlDark />} />
);
