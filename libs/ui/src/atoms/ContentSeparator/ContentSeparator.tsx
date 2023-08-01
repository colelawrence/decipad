import { FC } from 'react';
import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cssVar } from '../../primitives';

const styles = css({
  backgroundColor: cssVar('borderSubdued'),
  height: 1,
  margin: '6px 6px',
  width: '100%',
});

export const ContentSeparator = (): ReturnType<FC> => {
  return <RadixDropdownMenu.Separator css={styles} />;
};
