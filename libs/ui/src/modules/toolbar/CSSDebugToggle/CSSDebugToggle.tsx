import * as Styled from './styles';
import { useCallback } from 'react';

export const CSSDebugToggle = () => {
  const toggleDebugCSS = useCallback(() => {
    const isActive = document.body.classList.contains('css-debug');
    if (isActive) {
      document.body.classList.remove('css-debug');
    } else {
      document.body.classList.add('css-debug');
    }
  }, []);

  return <Styled.Toggle onClick={toggleDebugCSS}>Debug CSS</Styled.Toggle>;
};
