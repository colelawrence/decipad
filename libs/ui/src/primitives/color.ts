interface Color {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

export interface OpaqueColor extends Color {
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

export interface TransparentColor extends Color {
  readonly rgba: string;
}
// Only list the few opacities we use here so that
// we do not end up with all kinds of similar but not identical transparent colors.
export type Opacity = 0.02 | 0.08 | 0.65;
export function transparency(
  { red, green, blue }: OpaqueColor,
  opacity: Opacity
): TransparentColor {
  return {
    red,
    green,
    blue,
    rgba: `rgba(${red}, ${green}, ${blue}, ${opacity})`,
  };
}

export const purple100 = color(157, 139, 241);
export const electricGreen100 = color(235, 249, 186);
export const electricGreen200 = color(225, 249, 128);

export const white = color(255, 255, 255);
export const offWhite = color(249, 249, 250);
export const grey100 = color(245, 247, 250);
export const grey200 = color(236, 240, 246);
export const grey250 = color(229, 233, 240);
export const grey270 = color(170, 177, 189);
export const grey300 = color(119, 126, 137);
export const grey400 = color(77, 86, 100);
export const black = color(22, 31, 44);

export const blockquote = color(51, 41, 66);
export const codeBubbleBackground = color(223, 250, 233);
export const codeBubbleBorder = color(179, 229, 198);
export const codeErrorIconFill = color(253, 101, 101);
