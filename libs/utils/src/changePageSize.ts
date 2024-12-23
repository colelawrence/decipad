type ChangePageSizeOptions = {
  currentPage: number;
  currentPageSize: number;
  newPageSize: number;
};

export const changePageSize = ({
  currentPage,
  currentPageSize,
  newPageSize,
}: ChangePageSizeOptions): number => {
  const lowerBound = currentPage * currentPageSize;

  return Math.floor(lowerBound / newPageSize) + 1;
};
