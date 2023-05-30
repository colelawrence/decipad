/* eslint decipad/css-prop-named-variable: 0 */
import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const styles = css(blockAlignment.list.typography);

const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: 'inset(-2px -8px -2px -8px round 8px)',
});

type ListItemContentProps = {
  readonly children?: ReactNode;
};
export const ListItemContent = ({
  children,
}: ListItemContentProps): ReturnType<FC> => {
  const isBlockActive = useIsBlockActive();
  return <div css={[styles, isBlockActive && activeStyles]}>{children}</div>;
};
