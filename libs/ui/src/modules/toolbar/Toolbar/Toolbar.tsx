import { useWindowListener } from '@decipad/react-utils';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Deci } from '../../../icons';
import { CSSDebugToggle } from '../CSSDebugToggle/CSSDebugToggle';
import { FeatureFlagsSwitcher } from '../FeatureFlagsSwitcher/FeatureFlagsSwitcher';
import { FramerateIndicator } from '../FramerateIndicator/FramerateIndicator';
import { Permissions } from '../Permissions/Permissions';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

import { Plans } from '../Plans/Plans';
import * as Styled from './styles';

const inputSequence: string[] = [];

export const Toolbar = () => {
  const [hidden, setHidden] = useState<boolean>(() => {
    const storedHidden = localStorage.getItem('deciMateHidden');
    return storedHidden === null ? true : JSON.parse(storedHidden);
  });

  useWindowListener(
    'keydown',
    (event: KeyboardEvent) => {
      const konamiCode = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ];

      const handleKeyPress = (key: string) => {
        inputSequence.push(key);
        if (inputSequence.length > konamiCode.length) {
          inputSequence.shift();
        }
        if (inputSequence.join('') === konamiCode.join('')) {
          setHidden((prev) => {
            const newState = !prev;
            localStorage.setItem('deciMateHidden', JSON.stringify(newState));
            return newState;
          });
        }
      };

      handleKeyPress(event.key);
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
              Deci Mate
            </Styled.ToolbarTitle>
            <Styled.Tools>
              <FramerateIndicator />
              <FeatureFlagsSwitcher />
              <Permissions />
              <Plans />
              <ThemeToggle />
              <CSSDebugToggle />
            </Styled.Tools>
          </Styled.ToolbarWrapper>
        </Styled.ToolbarContainer>
      ) : null}
    </AnimatePresence>
  );
};
