import { ThumbnailIcon } from './ThumbnailIcon';
import { ThumbnailChatLight, ThumbnailChatDark } from './themed';

export const ThumbnailChat = () => (
  <ThumbnailIcon light={<ThumbnailChatLight />} dark={<ThumbnailChatDark />} />
);
