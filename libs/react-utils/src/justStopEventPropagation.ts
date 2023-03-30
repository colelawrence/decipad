import { UIEvent } from 'react';

export const justStopPropagation = <T extends UIEvent>(ev: T) => {
  ev.stopPropagation();
};
