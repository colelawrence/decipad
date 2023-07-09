import { cssVar, offBlack, transparency, weakOpacity } from '@decipad/ui';
import { css } from '@emotion/react';
import { Close } from 'libs/ui/src/icons';
import { closeButtonStyles } from 'libs/ui/src/styles/buttons';
import type { FC } from 'react';
import { ReactNode } from 'react';

const containerCss = css({
  border: `solid 1px ${cssVar('aiPanelBorderColor')}`,
  padding: 16,
  borderRadius: 10,
  boxShadow: `0px 2px 24px -4px ${transparency(offBlack, weakOpacity).rgba}`,
  marginTop: 10,
});

const additionalCloseButtonStyles = css({
  float: 'right',
  marginTop: -6,
});

type AIPanelContainerProps = {
  children: ReactNode;
  toggle: () => void;
};

export const AIPanelContainer: FC<AIPanelContainerProps> = ({
  children,
  toggle,
}) => {
  return (
    <div css={containerCss}>
      <button
        onClick={toggle}
        css={[closeButtonStyles, additionalCloseButtonStyles]}
      >
        <Close />
      </button>
      {children}
    </div>
  );
};
