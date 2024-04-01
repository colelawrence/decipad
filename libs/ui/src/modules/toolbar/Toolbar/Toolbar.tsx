import { useWindowListener } from '@decipad/react-utils';
import { useState } from 'react';
import * as Styled from './styles';
import { FramerateIndicator } from '../FramerateIndicator/FramerateIndicator';
import { Deci } from '../../../icons';
import { FeatureFlagsSwitcher } from '../FeatureFlagsSwitcher/FeatureFlagsSwitcher';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { CSSDebugToggle } from '../CSSDebugToggle/CSSDebugToggle';
import { AnimatePresence } from 'framer-motion';

export const Toolbar = () => {
  const [hidden, setHidden] = useState<boolean>(true);
  useWindowListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key?.toLowerCase() === 'f'
      ) {
        setHidden((prev) => !prev);
      }
    },
    true
  );

  return (
    <AnimatePresence>
      {!hidden ? (
        <Styled.ToolbarContainer>
          <Styled.ToolbarWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80, scaleX: 0.4, filter: 'blur(20px)' }}
          >
            <Styled.ToolbarTitle>
              <Styled.ToolbarIcon>
                <Deci />
              </Styled.ToolbarIcon>
              Deci Tools
            </Styled.ToolbarTitle>
            <Styled.Tools>
              <FramerateIndicator />
              <FeatureFlagsSwitcher />
              <ThemeToggle />
              <CSSDebugToggle />
            </Styled.Tools>
          </Styled.ToolbarWrapper>
        </Styled.ToolbarContainer>
      ) : null}
    </AnimatePresence>
  );
};
