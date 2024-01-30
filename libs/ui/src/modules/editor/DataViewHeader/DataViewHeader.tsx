import { FC } from 'react';

export interface TableHeaderProps {
  children?: React.ReactNode;
  isLastHeader?: boolean;
  isBottomLeftHeader?: boolean;
}

export const DataViewHeader = ({
  children,
}: TableHeaderProps): ReturnType<FC> => {
  return (
    <div>
      <div>{children}</div>
    </div>
  );
};
