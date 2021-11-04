import { css } from '@emotion/react';
import { Item } from '@radix-ui/react-dropdown-menu';
import { FC, ReactNode } from 'react';
import { cssVar, p12Regular, p14Medium } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  columnGap: '12px',

  clipPath: 'inset(-8px -8px -8px -8px round 8px)',
  ':hover, :focus': {
    backgroundColor: cssVar('highlightColor'),
    boxShadow: `0px 0px 0px 8px ${cssVar('highlightColor')}`,
  },
});

const iconStyles = css({
  width: '40px',
  height: '40px',

  display: 'grid',
  padding: '12px',

  backgroundColor: cssVar('iconBackgroundColor'),
  borderRadius: '6px',
});
const textStyles = css({
  display: 'grid',
  alignContent: 'center',
  rowGap: '6px',
});

interface SlashCommandsMenuItemProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;

  readonly onSelect?: () => void;
}
export const SlashCommandsMenuItem = ({
  icon,
  title,
  description,
  onSelect = noop,
}: SlashCommandsMenuItemProps): ReturnType<FC> => {
  return (
    <Item css={styles} onSelect={onSelect}>
      <span css={iconStyles}>{icon}</span>
      <div css={textStyles}>
        <strong css={css(p14Medium)}>{title}</strong>
        <span css={css(p12Regular)}>{description}</span>
      </div>
    </Item>
  );
};
