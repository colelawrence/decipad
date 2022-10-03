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
    <div>
      <p>There is a new version of Deci available.</p>
      <p>
        <a href="/" onClick={onReloadClick}>
          Click here to update
        </a>
      </p>
    </div>
  );
};
