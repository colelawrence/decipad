import { useState, useMemo } from 'react';

interface UsePaginationResult<T> {
  page: number;
  offset: number;
  presentRowCount: number;
  valuesForPage: Array<T>;
  setPage: (page: number) => void;
}

type UseSimplePaginationResult<T> = Omit<
  UsePaginationResult<T>,
  'presentRowCount'
>;

interface UsePaginationProps<T> {
  all: Array<T>;
  maxRowsPerPage: number;
}

export const usePagination = <B, T extends Array<B>>({
  all,
  maxRowsPerPage,
}: UsePaginationProps<T>): UsePaginationResult<T> => {
  const [page, setPage] = useState(1);
  const offset = useMemo(
    () => (page - 1) * maxRowsPerPage,
    [maxRowsPerPage, page]
  );
  const valuesForPage = useMemo(
    () => all.map((col) => col.slice(offset, offset + maxRowsPerPage)),
    [all, maxRowsPerPage, offset]
  ) as Array<T>;

  return useMemo(
    () => ({
      page,
      offset,
      valuesForPage,
      setPage,
      presentRowCount: Math.max(...valuesForPage.map((v) => v.length)),
    }),
    [page, offset, valuesForPage]
  );
};

export const useSimplePagination = <T>({
  all,
  maxRowsPerPage,
}: UsePaginationProps<T>): UseSimplePaginationResult<T> => {
  const [page, setPage] = useState(1);
  const offset = useMemo(
    () => (page - 1) * maxRowsPerPage,
    [maxRowsPerPage, page]
  );
  const valuesForPage = useMemo(
    () => all.slice(offset, offset + maxRowsPerPage),
    [all, maxRowsPerPage, offset]
  ) as Array<T>;

  return useMemo(
    () => ({
      page,
      offset,
      valuesForPage,
      setPage,
    }),
    [page, offset, valuesForPage]
  );
};
