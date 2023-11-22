import { createImagePlugin as _createImagePlugin } from '@udecode/plate-media';

export const createImagePlugin = () =>
  _createImagePlugin({
    options: {
      disableUploadInsert: true,
    },
  });
