import { MouseEvent, useCallback } from 'react';

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
      <span>Auto-refreshing ✨</span>
    </a>
  );
};
