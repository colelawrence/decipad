import { useEventNoEffect } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { FC, PropsWithChildren } from 'react';

export const VoidBlock: FC<
  PropsWithChildren<{ dontPreventDefault?: boolean }>
> = ({ children, dontPreventDefault = false }) => {
  const discardEvents = useEventNoEffect(noop, dontPreventDefault);
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
