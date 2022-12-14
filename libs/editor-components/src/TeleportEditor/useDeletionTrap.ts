import { useSelection } from '@decipad/editor-utils';
import { isCollapsed } from '@udecode/plate';
import { useEffect } from 'react';

/**
 * Will prevent backspace from deleting the block if the selection is at the start of the block.
 *
 * @param shouldPreventDeletion - boolean flag to determine if backspace should be cancelled
 * @param onPreventDeletion - callback to run when backspace is cancelled
 */
export const useDeletionTrap = (
  shouldPreventDeletion: boolean,
  onPreventDeletion?: () => void
) => {
  let shouldPreventBackspace = false;
  const selection = useSelection();
  const collapsed = isCollapsed(selection);

  if (selection && collapsed) {
    const isAtBlockStart =
      selection.anchor.path[1] === 0 && selection.anchor.offset === 0;

    shouldPreventBackspace = isAtBlockStart && shouldPreventDeletion;

    onPreventDeletion?.();
  }

  useEffect(() => {
    if (!shouldPreventBackspace) return;

    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace') return;

      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('keydown', onWindowKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onWindowKeyDown, true);
    };
  }, [shouldPreventBackspace]);
};
