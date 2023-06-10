import { Opacity } from './color';

export interface Viewport {
  readonly width: number;
  readonly height: number;
}
export interface Device {
  readonly portrait: Viewport;
  readonly landscape: Viewport;
}

export function device(side0: number, side1: number): Device {
  const min = Math.min(side0, side1);
  const max = Math.max(side0, side1);
  return {
    portrait: { width: min, height: max },
    landscape: { width: max, height: min },
  };
}

export const tableBorderColor = 'rgba(0, 0, 0, 0.1)';
export const dragHandleHighlight = 'rgba(0, 0, 0, 0.05)';
export const placeholderOpacity: Opacity = 0.4;

export const smallestMobile = device(360, 640);
export const smallestDesktop = device(1279, 720);
export const largestDesktop = device(3840, 2160);

export const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;
export const mobileQuery = `@media (max-width: ${smallestMobile.landscape.width}px)`;
