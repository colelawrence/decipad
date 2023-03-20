import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';

const invisibleWrapperStyles = css({
  display: 'none',
});

export const Invisible: FC<PropsWithChildren> = ({ children }) => (
  <div css={invisibleWrapperStyles}>{children}</div>
);
