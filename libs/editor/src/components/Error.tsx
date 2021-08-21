import { FC } from 'react';
import { css } from '@emotion/react';

const styles = css({
  color: '#f55',
});

export function Error({ message }: { message: string }): ReturnType<FC> {
  return <span css={styles}>Error: {message}</span>;
}
