import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { Warning } from '../../icons';
import { cssVar, setCssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const { callout } = blockAlignment;

const verticalPadding = '12px';
const verticalMargin = `calc(${callout.paddingTop} - ${verticalPadding})`;

const styles = css(
  callout.typography,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '8px',

    display: 'grid',
    gridTemplateColumns: '16px 1fr',
    gridGap: '16px',

    margin: `${verticalMargin} auto 0 auto`,
    padding: `${verticalPadding} 16px`,
  }
);

const iconWrapperStyles = css({
  alignItems: 'center',
  display: 'grid',
  height: `calc(${callout.typography?.fontSize} * ${callout.typography?.lineHeight})`,
  width: '16px',
});

interface BlockquoteProps {
  readonly children: ReactNode;
}

export const Callout = ({
  children,
}: BlockquoteProps): ReturnType<React.FC> => {
  return (
    <div css={styles}>
      <span css={iconWrapperStyles}>
        <Warning />
      </span>
      {children}
    </div>
  );
};
