const acceptableFileTypes = ['text/csv', 'application/json'];
const maxFileSizeBytes = 1_000_000;

export const validateItemAndGetFile = (item: DataTransferItem): File | true => {
  const file = item.getAsFile();
  if (!file) {
    if (!acceptableFileTypes.includes(item.type)) {
      throw new Error(`Cannot import file of type ${item.type}`);
    }
    return true;
  }

  if (!acceptableFileTypes.includes(file.type)) {
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
