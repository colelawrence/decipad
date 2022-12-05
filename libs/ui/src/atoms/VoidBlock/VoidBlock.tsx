import { useEventNoEffect } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { FC, PropsWithChildren } from 'react';

export const VoidBlock: FC<PropsWithChildren> = ({ children }) => {
  const discardEvents = useEventNoEffect(noop);
  return (
    <div
      contentEditable={false}
      onClick={discardEvents}
      onPointerDown={discardEvents}
      onMouseDown={discardEvents}
      onDrop={discardEvents}
      onKeyDown={discardEvents}
    >
      {children}
    </div>
  );
};
