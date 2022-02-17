import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.list.typography);

type ListItemProps = {
  readonly children?: ReactNode;
};
export const ListItem = ({ children }: ListItemProps): ReturnType<FC> => {
  return <div css={styles}>{children}</div>;
};
