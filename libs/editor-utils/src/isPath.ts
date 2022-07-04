import { Path } from 'slate';

export const isPath = (path: Path | undefined): path is Path => {
  return Path.isPath(path);
};
