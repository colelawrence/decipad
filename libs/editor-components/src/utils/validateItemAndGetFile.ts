import type { FileType } from '@decipad/editor-types';
import {
  MAX_UPLOAD_FILE_SIZE,
  SUPPORTED_FILE_TYPES,
} from '@decipad/editor-types';

const acceptableFileTypes = ['text/csv', 'application/json', 'image/'];
export const validFileType = (type: string) =>
  acceptableFileTypes.some((prefix) => type.startsWith(prefix));

export const validateItemAndGetFile = (item: DataTransferItem): File | true => {
  if (item.kind !== 'file') throw new Error(`Item kind is not a file`);

  const file = item.getAsFile();
  if (!file) {
    if (!validFileType(item.type)) {
      throw new Error(`Cannot import file of type ${item.type}`);
    }
    return true;
  }
  const fileType = file.type.split('/')[0] as FileType;

  let maxFileSizeBytes;
  if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
    maxFileSizeBytes = MAX_UPLOAD_FILE_SIZE.data;
  } else {
    maxFileSizeBytes = MAX_UPLOAD_FILE_SIZE[fileType];
  }

  if (!validFileType(file.type)) {
    console.warn(
      'Expected one of types',
      acceptableFileTypes,
      'but received file',
      file,
      'with type',
      file.type
    );
    throw new Error(`Cannot import file of type ${file.type}`);
  }

  if (file.size > maxFileSizeBytes) {
    console.warn(
      'Expected only files smaller than',
      maxFileSizeBytes,
      'bytes but received file',
      file,
      'with size',
      file.size
    );
    throw new Error(
      `File too big (${file.size} bytes). Will only accept files smaller than ${maxFileSizeBytes} bytes.`
    );
  }

  return file;
};
