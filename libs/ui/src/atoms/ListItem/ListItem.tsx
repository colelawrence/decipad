import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { p16Regular } from '../../primitives';

const styles = css(p16Regular);

type ListItemProps = {
  readonly children?: ReactNode;
};
export const ListItem = ({ children }: ListItemProps): ReturnType<FC> => {
  return <div css={styles}>{children}</div>;
};
