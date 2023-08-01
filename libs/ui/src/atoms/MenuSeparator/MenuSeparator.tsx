import { FC } from 'react';
import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cssVar } from '../../primitives';

const styles = css({
  backgroundColor: cssVar('borderSubdued'),
  height: 1,
  margin: '6px 6px',
});

export const MenuSeparator = (): ReturnType<FC> => {
  return <RadixDropdownMenu.Separator css={styles} />;
};
