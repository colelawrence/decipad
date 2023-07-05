export type FileType = 'image' | 'media' | 'data';

// TODO: changes this to enable different thresholds per plan
export const MAX_UPLOAD_FILE_SIZE = {
  // attachments
  image: {
    free: 1_000_000,
    pro: 10_000_000,
  },
  // not supported yet
  media: {
    free: 5_000_000,
    pro: 5_000_000,
  },
  data: {
    free: 1_000_000,
    pro: 10_000_000,
  },
  // notebooks
  notebook: {
    free: 10_000_000,
    pro: 10_000_000,
  },
};

export const MAX_IMPORT_CELL_COUNT = {
  free: 10000,
  pro: 30000,
};

export const MAX_REFRESH_EXEC_COUNT = {
  free: 50,
  pro: 500,
};
