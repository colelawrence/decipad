/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.list.typography);

type ListItemContentProps = {
  readonly children?: ReactNode;
};
export const ListItemContent = ({
  children,
}: ListItemContentProps): ReturnType<FC> => {
  return (
    <div className="block-li" css={styles}>
      {children}
    </div>
  );
};
