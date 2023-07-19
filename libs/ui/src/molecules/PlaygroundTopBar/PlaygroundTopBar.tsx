import { BetaBadge, Button, Link, p14Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import { Deci } from '../../icons';

export const PlaygroundTopBar = () => (
  <div css={playTopBarWrapperStyles}>
    <div css={playLeftSideStyles}>
      <span css={playIconStyles}>
        <Link href="https://decipad.com">
          <Deci />
        </Link>
      </span>
      Decipad — Playground
      <BetaBadge />
    </div>
    <div css={playRightSideStyles}>
      <Button href="/" type={'primaryBrand'}>
        Log-in
      </Button>
    </div>
  </div>
);

const playTopBarWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  rowGap: '8px',

  padding: '16px 0',
});

const playLeftSideStyles = css(p14Medium, {
  flex: 1,

  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

  display: 'flex',
  alignItems: 'center',
  gap: '6px',

  maxWidth: '450px',
});

const playRightSideStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1em',
});

const playIconStyles = css({
  display: 'grid',
  height: '16px',
  width: '16px',
});
