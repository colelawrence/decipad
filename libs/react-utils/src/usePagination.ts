import { useState, useMemo } from 'react';
import { slice, empty } from '@decipad/generator-utils';
import { type Result } from '@decipad/language-interfaces';

interface UsePaginationResult {
  page: number;
  pageSize: number;
  offset: number;
  presentRowCount: number;
  valuesForPage: Array<() => AsyncGenerator<Result.OneResult>>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

interface UsePaginationProps {
  all?: Array<Result.ResultColumn>;
  totalRowCount: number;

  startingPageSize: number;
}

export const usePagination = ({
  all,
  totalRowCount,
  startingPageSize,
}: UsePaginationProps): UsePaginationResult => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(startingPageSize);

  const offset = (page - 1) * pageSize;

  const valuesForPage = useMemo(
    () =>
      all != null ? all.map((col) => () => col(offset, offset + pageSize)) : [],
    [all, pageSize, offset]
  );

  return useMemo(
    () => ({
      page,
      pageSize,
      offset,
      valuesForPage,
      setPage,
      setPageSize,
      presentRowCount: Math.min(totalRowCount - offset, pageSize),
    }),
    [page, offset, valuesForPage, totalRowCount, pageSize]
  );
};

interface UseSimplePaginationProps<T> {
  all?: () => AsyncGenerator<T>;
  maxRowsPerPage: number;
}

type UseSimplePaginationResult<T> = Omit<
  UsePaginationResult,
  'presentRowCount' | 'valuesForPage' | 'pageSize' | 'setPageSize'
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
