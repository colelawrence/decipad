import { FileType, MAX_UPLOAD_FILE_SIZE } from '@decipad/editor-types';
import { Link } from 'libs/ui/src/shared/atoms';
import { ReactNode } from 'react';

interface AddOns {
  giphy?: boolean;
  unsplash?: boolean;
  replicate?: boolean;
}

interface FileCfg {
  title: string;
  description?: ReactNode;
  maxSize: number;
  accept?: string;
  acceptHuman?: string[];
  addons: AddOns;
}

export const getConfigForFileType = (
  fileType: FileType | undefined
): FileCfg => {
  switch (fileType) {
    case 'image':
      return {
        title: 'Add an image',
        maxSize: MAX_UPLOAD_FILE_SIZE.image,
        accept: 'image/jpeg, image/png, image/gif',
        acceptHuman: ['jpg', 'gif', 'png'],
        addons: { giphy: true, unsplash: true, replicate: true },
      };
    case 'media':
      return {
        title: 'Insert video',
        maxSize: MAX_UPLOAD_FILE_SIZE.media,
        accept: 'video/*',
        acceptHuman: ['mp4', 'gif'],
        addons: {},
      };
    case 'embed':
      return {
        title: 'Embed URL',
        maxSize: MAX_UPLOAD_FILE_SIZE.embed,
        addons: {},
        description: (
          <>
            Note that embeds are experimental. Check out{' '}
            <Link href="https://app.decipad.com/docs/quick-start/embed-on-decipad">
              our documentation
            </Link>{' '}
            if you run into issues.
          </>
        ),
      };
    default:
      return { title: 'Upload a file', maxSize: 5_000_000, addons: {} };
  }
};

export const unsplashBeans = [
  'Vector',
  'Abstract',
  'People',
  'Travel',
  'Wellness',
  'Family',
  'Vintage',
  'Beauty',
  'Space',
  'Architecture',
  'Art',
];

export const giphyBeans = [
  'Trending',
  'Thumbs up',
  'Congratulations',
  'Thank you',
  'Excited',
];
