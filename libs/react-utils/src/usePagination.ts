import { useState, useMemo } from 'react';
import { slice, empty } from '@decipad/generator-utils';

interface UsePaginationResult<T> {
  page: number;
  offset: number;
  presentRowCount: number;
  valuesForPage: Array<() => AsyncGenerator<T>>;
  setPage: (page: number) => void;
}

type UseSimplePaginationResult<T> = Omit<
  UsePaginationResult<T>,
  'presentRowCount' | 'valuesForPage'
> & {
  valuesForPage: () => AsyncGenerator<T>;
};

interface UsePaginationProps<T> {
  all?: Array<() => AsyncGenerator<T>>;
  totalRowCount: number;
  maxRowsPerPage: number;
}

export const usePagination = <T>({
  all,
  totalRowCount,
  maxRowsPerPage,
}: UsePaginationProps<T>): UsePaginationResult<T> => {
  const [page, setPage] = useState(1);
  const offset = useMemo(
    () => (page - 1) * maxRowsPerPage,
    [maxRowsPerPage, page]
  );
  const valuesForPage = useMemo(
    () =>
      all != null
        ? all.map((col) => () => slice(col(), offset, offset + maxRowsPerPage))
        : [],
    [all, maxRowsPerPage, offset]
  );

  return useMemo(
    () => ({
      page,
      offset,
      valuesForPage,
      setPage,
      presentRowCount: Math.min(totalRowCount - offset, maxRowsPerPage),
    }),
    [page, offset, valuesForPage, totalRowCount, maxRowsPerPage]
  );
};

interface UseSimplePaginationProps<T> {
  all?: () => AsyncGenerator<T>;
  maxRowsPerPage: number;
}

export const useSimplePagination = <T>({
  all,
  maxRowsPerPage,
}: UseSimplePaginationProps<T>): UseSimplePaginationResult<T> => {
  const [page, setPage] = useState(1);
  const offset = useMemo(
    () => (page - 1) * maxRowsPerPage,
    [maxRowsPerPage, page]
  );
  const valuesForPage = useMemo(
    () => (): AsyncGenerator<T> =>
      all ? slice(all(), offset, offset + maxRowsPerPage) : empty(),
    [all, maxRowsPerPage, offset]
  );

  return useMemo(
    (): UseSimplePaginationResult<T> => ({
      page,
      offset,
      valuesForPage,
      setPage,
    }),
    [page, offset, valuesForPage]
  );
};
