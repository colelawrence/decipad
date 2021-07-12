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

export const smallestMobile = device(360, 640);
export const smallestDesktop = device(1280, 720);
export const largestDesktop = device(3840, 2160);
