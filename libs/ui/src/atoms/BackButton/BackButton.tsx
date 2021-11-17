import { css } from '@emotion/react';
import { FC } from 'react';
import { LeftArrow } from '../../icons';
import { cssVar } from '../../primitives';
import { Anchor } from '../../utils';

interface BackButtonProps {
  href: string;
}

const buttonStyles = css({
  width: '32px',
  height: '32px',
  backgroundColor: cssVar('highlightColor'),
  borderRadius: '100vmax',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const iconStyles = css({
  width: '20px',
  height: '20px',
  display: 'inline-block',
});

export const BackButton = ({ href }: BackButtonProps): ReturnType<FC> => {
  return (
    <Anchor href={href} css={buttonStyles}>
      <span css={iconStyles}>
        <LeftArrow />
      </span>
    </Anchor>
  );
};
