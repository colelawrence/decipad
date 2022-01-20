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
export type Opacity = 0.02 | 0.08 | 0.65 | 0.8;
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

export const electricGreen100 = color(205, 251, 137);
export const electricGreen200 = color(193, 250, 107);

export const red100 = color(252, 218, 218);
export const red200 = color(249, 181, 181);
export const red300 = color(246, 143, 143);
export const red400 = color(243, 106, 106);
export const red500 = color(240, 69, 69);
export const red600 = color(216, 49, 49);

export const orange100 = color(255, 232, 209);
export const orange200 = color(255, 209, 163);
export const orange300 = color(255, 186, 117);
export const orange400 = color(255, 163, 71);
export const orange500 = color(255, 140, 25);
export const orange600 = color(238, 125, 13);

export const purple300 = color(171, 165, 252);
export const electricGreen500 = color(193, 250, 107);

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
export const codeBubbleBackground = color(230, 237, 255);
export const codeBubbleText = color(50, 102, 245);
export const codeErrorIconFill = color(253, 101, 101);
export const logoSecondColor = color(207, 253, 136);
export const logoThirdColor = color(175, 245, 72);
