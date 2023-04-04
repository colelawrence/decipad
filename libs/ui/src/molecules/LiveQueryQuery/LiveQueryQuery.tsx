import { FC, PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { code, cssVar } from '../../primitives';

const liveQueryWrapperStyles = css(code, {
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '6px',
  padding: '6px',
  margin: '0.5rem 0',
});

export const LiveQueryQuery: FC<PropsWithChildren> = ({ children }) => {
  return <div css={liveQueryWrapperStyles}>{children}</div>;
};
