import { css } from '@emotion/react';
import { Sparkles } from '../../icons';
import {
  componentCssVars,
  cssVar,
  easingTiming,
  p13Bold,
} from '../../primitives';

import * as Switch from '@radix-ui/react-switch';

const switchWrapperStyles = css({
  background: cssVar('backgroundHeavy'),
  borderRadius: '6px',
  display: 'flex',
  gap: '8px',
  padding: '0px 8px',
  alignItems: 'center',
  height: '32px',
});

const switchIconStyles = css({
  display: 'flex',
  height: '16px',
  width: '16px',

  '& svg': {
    width: '16px',
    height: '16px',

    '& path': {
      stroke: cssVar('textDefault'),
    },
  },
});

const switchStyles = css({
  all: 'unset',
  width: 34,
  height: 18,
  background: cssVar('borderDefault'),
  borderRadius: '9px',
  position: 'relative',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&[data-state="checked"]': {
    backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
  },
});

const switchThumbStyles = css({
  display: 'block',
  width: 14,
  height: 14,
  backgroundColor: componentCssVars('AIAssistantTextColor'),
  borderRadius: '50%',
  transition: `transform 100ms ${easingTiming.easeOut}`,
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(18px)' },
});

const labelStyles = css({
  ...p13Bold,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

type AIModeSwitchProps = {
  onChange: (value: boolean) => void;
  value: boolean;
};

export const AIModeSwitch: React.FC<AIModeSwitchProps> = ({
  value,
  onChange,
}) => {
  return (
    <div css={switchWrapperStyles}>
      <label css={labelStyles} htmlFor="ai-mode">
        <div css={switchIconStyles}>
          <Sparkles />
        </div>
        AI
      </label>
      <Switch.Root
        css={switchStyles}
        id="ai-mode"
        checked={value}
        onCheckedChange={onChange}
      >
        <Switch.Thumb css={switchThumbStyles} />
      </Switch.Root>
    </div>
  );
};
