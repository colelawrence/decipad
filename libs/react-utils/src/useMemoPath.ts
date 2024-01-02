import { useMemo } from 'react';
import { Path } from 'slate';

// Ensure that React treats identical path arrays as equal.
export const useMemoPath = <T extends Path | null | undefined>(path: T): T =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => path, path || []);
