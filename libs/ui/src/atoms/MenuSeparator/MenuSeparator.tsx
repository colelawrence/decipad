import { FC } from 'react';
import { css } from '@emotion/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { grey300 } from '../../primitives';

const styles = css({
  backgroundColor: grey300.rgb,
  height: 1,
  margin: '6px 6px',
});

export const MenuSeparator = (): ReturnType<FC> => {
  return <RadixDropdownMenu.Separator css={styles} />;
};
