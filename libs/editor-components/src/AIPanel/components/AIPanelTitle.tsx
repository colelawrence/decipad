import type { FC } from 'react';
import { componentCssVars, p13Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import { Sparkles } from 'libs/ui/src/icons';

const containerCss = css(p13Medium, {
  display: 'flex',
  gridGap: 6,
  alignItems: 'flex-end',
  marginBottom: 15,
});

const sparklesSquareCss = css({
  width: 20,
  height: 20,
  display: 'flex',
  justifyContent: 'center',
  borderRadius: 4,
  svg: {
    width: 16,
    fill: componentCssVars('AiTextColor'),
    stroke: componentCssVars('AiTextColor'),
  },
});

type AIPanelTitleProps = { children: string };

export const AIPanelTitle: FC<AIPanelTitleProps> = ({ children }) => {
  return (
    <div css={containerCss} contentEditable={false}>
      <div css={sparklesSquareCss}>
        <Sparkles />
      </div>
      {children}
    </div>
  );
};
