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
      Decipad has a new version.&nbsp;
      <span>Click here to update ✨</span>
    </a>
  );
};
