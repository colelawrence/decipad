export interface OpaqueColor {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly rgb: string;
}

export function color(red: number, green: number, blue: number): OpaqueColor {
  return {
    red,
    green,
    blue,
    rgb: `rgb(${red}, ${green}, ${blue})`,
  };
}

export const purple100 = color(157, 139, 241);
export const electricGreen100 = color(235, 249, 186);
export const electricGreen200 = color(225, 249, 128);

export const white = color(255, 255, 255);
export const offWhite = color(249, 249, 250);
export const grey100 = color(240, 240, 242);
export const grey200 = color(223, 223, 224);
export const grey300 = color(137, 137, 142);
export const grey400 = color(67, 67, 71);
export const black = color(18, 18, 20);
