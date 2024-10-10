import { css } from '@emotion/react';
import { ReactNode } from 'react';

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const FormWrapper = ({ children }: { children: ReactNode }) => {
  return <div css={wrapperStyles}>{children}</div>;
};
