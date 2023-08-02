export type FileType = 'image' | 'media' | 'data';

export const MAX_UPLOAD_FILE_SIZE = {
  // JPEG, JPG, GIF, PNG
  image: 5_000_000,
  // not supported yet
  media: 5_000_000,
  // JSON, CSV
  data: 500_000,
  // notebooks --> check if needed
  notebook: 10_000_000,
};

export const SUPPORTED_FILE_TYPES = Object.keys(MAX_UPLOAD_FILE_SIZE);

export const MAX_IMPORT_CELL_COUNT = 10000;

// NOT USED YET
export const MAX_ATTACHMENT_SIZE = {
  free: 50_000_000,
  pro: 200_000_000,
};
