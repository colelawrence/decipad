import { useState, useMemo } from 'react';
import { slice, empty } from '@decipad/generator-utils';
import { type Result } from '@decipad/language-interfaces';

interface UsePaginationResult {
  page: number;
  offset: number;
  presentRowCount: number;
  valuesForPage: Array<() => AsyncGenerator<Result.OneResult>>;
  setPage: (page: number) => void;
}

interface UsePaginationProps {
  all?: Array<Result.ResultColumn>;
  totalRowCount: number;
  maxRowsPerPage: number;
}

export const usePagination = ({
  all,
  totalRowCount,
  maxRowsPerPage,
}: UsePaginationProps): UsePaginationResult => {
  const [page, setPage] = useState(1);
  const offset = useMemo(
    () => (page - 1) * maxRowsPerPage,
    [maxRowsPerPage, page]
  );
  const valuesForPage = useMemo(
    () =>
      all != null
        ? all.map((col) => () => col(offset, offset + maxRowsPerPage))
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

type UseSimplePaginationResult<T> = Omit<
  UsePaginationResult,
  'presentRowCount' | 'valuesForPage'
> & {
  valuesForPage: () => AsyncGenerator<T>;
};

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
