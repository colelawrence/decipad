import { css } from '@emotion/react';
import { Sparkles } from '../../icons';
import { componentCssVars, cssVar, p13Bold } from '../../primitives';

import * as Switch from '@radix-ui/react-switch';
import { motion } from 'framer-motion';

const switchWrapperStyles = css({
  background: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  borderRadius: '6px',
  display: 'flex',
  gap: '8px',
  padding: '0px 8px',
  alignItems: 'center',
  height: '32px',
  cursor: 'pointer',
  userSelect: 'none',
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
      fill: cssVar('textDefault'),
    },
  },
});

const switchStyles = css({
  all: 'unset',
  width: 32,
  padding: 2,
  background: cssVar('backgroundHeavy'),
  borderRadius: '9px',
  position: 'relative',
  display: 'inline-flex',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&[data-state="checked"]': {
    backgroundColor: componentCssVars('AIAssistantBackgroundColor'),
    justifyContent: 'flex-end',
  },
  cursor: 'pointer',
});

const switchThumbStyles = css({
  display: 'block',
  width: 14,
  height: 14,
  backgroundColor: componentCssVars('AIAssistantTextColor'),
  borderRadius: '50%',
});

const labelStyles = css({
  ...p13Bold,
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
        asChild
        id="ai-mode"
        checked={value}
        onCheckedChange={onChange}
      >
        <motion.button layout css={switchStyles}>
          <Switch.Thumb asChild>
            <motion.span
              layout
              transition={{
                duration: 0.06,
              }}
              css={switchThumbStyles}
            />
          </Switch.Thumb>
        </motion.button>
      </Switch.Root>
    </div>
  );
};
