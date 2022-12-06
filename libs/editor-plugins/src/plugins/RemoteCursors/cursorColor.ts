import { OpaqueColor, swatchNames, baseSwatches } from '@decipad/ui';

export const cursorColor = (clientID: number): OpaqueColor => {
  return baseSwatches[swatchNames[clientID % swatchNames.length]];
};
