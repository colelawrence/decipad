import { css } from '@emotion/react';
import { Sparkles } from '../../icons';
import {
  componentCssVars,
  cssVar,
  easingTiming,
  p13Medium,
} from '../../primitives';

import * as Switch from '@radix-ui/react-switch';

const switchWrapperStyles = css({
  background: componentCssVars('AIAssistantHighlightColor'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  height: '32px',
});

const switchIconStyles = css({
  padding: '8px',

  '& svg': {
    width: '16px',
    height: '16px',

    '& path': {
      stroke: componentCssVars('AIAssistantTextColor'),
    },
  },
});

const switchContainerStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  padding: '0px 8px',
  height: '100%',
  borderRadius: '6px',
  boxShadow: `0px 0px 0px 2px ${cssVar('backgroundMain')}`,
  cursor: 'pointer',
});

const switchStyles = css({
  all: 'unset',
  width: 34,
  height: 18,
  backgroundColor: componentCssVars('AIAssistantTextSubduedColor'),
  borderRadius: '9px',
  position: 'relative',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&[data-state="checked"]': {
    backgroundColor: componentCssVars('AIAssistantTextColor'),
  },
});

const switchThumbStyles = css({
  display: 'block',
  width: 14,
  height: 14,
  backgroundColor: componentCssVars('AIAssistantHighlightColor'),
  borderRadius: '50%',
  transition: `transform 100ms ${easingTiming.easeOut}`,
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(18px)' },
});

const labelStyles = css({
  ...p13Medium,
  color: componentCssVars('AIAssistantTextColor'),
  cursor: 'pointer',
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
      <div css={switchIconStyles}>
        <Sparkles />
      </div>
      <div css={switchContainerStyles}>
        <label css={labelStyles} htmlFor="ai-mode">
          AI Mode
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
    </div>
  );
};
