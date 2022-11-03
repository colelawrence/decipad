import { css } from '@emotion/react';
import { MouseEvent, useCallback } from 'react';
import { cssVar } from '../../primitives';

interface UpdatePromptProps {
  onReload: () => void;
}

export const UpdatePrompt = ({ onReload }: UpdatePromptProps) => {
  const onReloadClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onReload();
    },
    [onReload]
  );

  return (
    <a href="/" onClick={onReloadClick}>
      Decipad has updated.&nbsp;
      <span css={css({ color: cssVar('weakerTextColor') })}>
        Auto-refreshing ✨
      </span>
    </a>
  );
};
