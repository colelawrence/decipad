import { createImagePlugin as _createImagePlugin } from '@udecode/plate';

export const createImagePlugin = () =>
  _createImagePlugin({
    options: {
      disableUploadInsert: true,
    },
  });
