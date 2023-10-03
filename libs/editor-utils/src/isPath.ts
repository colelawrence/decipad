import { Path } from 'slate';

export const isPath = (path: unknown): path is Path => {
  return Path.isPath(path);
};
