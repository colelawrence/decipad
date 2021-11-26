import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { p16Regular } from '../../primitives';
import { SlateElementProps } from '../../utils';

const styles = css(p16Regular);

type ListItemProps = SlateElementProps & {
  readonly children?: ReactNode;
};
export const ListItem = ({
  children,
  slateAttrs,
}: ListItemProps): ReturnType<FC> => {
  return (
    <div {...slateAttrs} css={styles}>
      {children}
    </div>
  );
};
