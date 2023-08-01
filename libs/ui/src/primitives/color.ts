interface Color {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

export interface OpaqueColor extends Color {
  readonly rgb: string;
  readonly hex: string;
}
export function color(red: number, green: number, blue: number): OpaqueColor {
  return {
    red,
    green,
    blue,
    rgb: `rgb(${red}, ${green}, ${blue})`,
    hex: opaqueColorToHex({ red, green, blue }),
  };
}

function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export function hexToOpaqueColor(hex: string): OpaqueColor | null {
  const result = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
  if (!result) return null;
  const [red, green, blue] = [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
  return {
    red,
    green,
    blue,
    rgb: `rgb(${red}, ${green}, ${blue})`,
    hex,
  };
}

export function opaqueColorToHex(
  clr: Pick<OpaqueColor, 'red' | 'green' | 'blue'>
): string {
  return `#${componentToHex(clr.red)}${componentToHex(
    clr.green
  )}${componentToHex(clr.blue)}`;
}

export interface TransparentColor extends Color {
  readonly rgba: string;
}
// Only list the few opacities we use here so that
// we do not end up with all kinds of similar but not identical transparent colors.
export type Opacity =
  | 0
  | 0.02
  | 0.04
  | 0.06
  | 0.08
  | 0.1
  | 0.16
  | 0.2
  | 0.3
  | 0.4
  | 0.5
  | 0.65
  | 0.8
  | 1;
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

//
// gray
//
export const white = color(255, 255, 255);
export const offWhite = color(249, 249, 250);
export const grey50 = color(250, 252, 255);
export const grey100 = color(245, 247, 250);
export const grey200 = color(236, 240, 246);
export const grey300 = color(229, 233, 240);
export const grey400 = color(170, 177, 189);
export const grey500 = color(119, 126, 137);
export const grey600 = color(77, 86, 100);
export const grey700 = color(50, 59, 73);

export const offBlack = color(22, 31, 44);
export const black = color(0, 0, 0);
export const blackWhiteBlack = color(22, 31, 44);
export const fullTransparent = transparency(blackWhiteBlack, 0);

//
// brand
//
export const brand50 = color(249, 255, 235);
export const brand100 = color(243, 254, 225);
export const brand200 = color(230, 253, 196);
export const brand300 = color(218, 252, 166);
export const brand400 = color(205, 251, 137);
export const brand500 = color(193, 250, 107);
export const brand600 = color(154, 200, 86);
export const brand700 = color(116, 150, 64);
export const brand800 = color(77, 100, 43);
export const brand900 = color(39, 50, 21);

//
// purple
//
export const purple50 = color(241, 240, 255);
export const purple100 = color(227, 225, 254);
export const purple200 = color(199, 195, 253);
export const purple300 = color(171, 165, 252);
export const purple400 = color(143, 135, 251);
export const purple500 = color(115, 105, 250);
export const purple600 = color(92, 84, 200);
export const purple700 = color(69, 63, 150);
export const purple800 = color(41, 40, 58);
export const purple900 = color(27, 26, 40);

//
// blue
//
export const blue50 = color(232, 242, 255);
export const blue100 = color(214, 224, 253);
export const blue200 = color(173, 194, 251);
export const blue300 = color(132, 163, 249);
export const blue400 = color(91, 133, 247);
export const blue500 = color(50, 102, 245);
export const blue600 = color(40, 82, 196);
export const blue700 = color(30, 61, 147);
export const blue800 = color(20, 41, 98);
export const blue900 = color(10, 20, 49);

//
// teal
//
export const teal50 = color(242, 250, 249);
export const teal100 = color(208, 241, 237);
export const teal200 = color(161, 227, 219);
export const teal300 = color(115, 213, 201);
export const teal400 = color(68, 199, 183);
export const teal500 = color(21, 185, 165);
export const teal600 = color(17, 148, 132);
export const teal700 = color(13, 111, 99);
export const teal800 = color(8, 74, 66);
export const teal900 = color(4, 37, 33);

//
// orange
//
export const orange50 = color(255, 247, 240);
export const orange100 = color(255, 232, 209);
export const orange200 = color(255, 209, 163);
export const orange300 = color(255, 186, 117);
export const orange400 = color(255, 163, 71);
export const orange500 = color(255, 140, 25);
export const orange600 = color(204, 112, 20);
export const orange700 = color(153, 84, 15);
export const orange800 = color(102, 56, 10);
export const orange900 = color(51, 28, 5);

//
// yellow
//
export const yellow50 = color(255, 253, 243);
export const yellow100 = color(255, 248, 217);
export const yellow200 = color(255, 241, 179);
export const yellow300 = color(255, 234, 142);
export const yellow400 = color(255, 227, 104);
export const yellow500 = color(255, 220, 66);
export const yellow600 = color(245, 213, 72);
export const yellow700 = color(181, 152, 25);
export const yellow800 = color(102, 88, 26);
export const yellow900 = color(51, 44, 13);

//
// red
//
export const red50 = color(254, 245, 245);
export const red100 = color(252, 218, 218);
export const red200 = color(249, 181, 181);
export const red300 = color(246, 143, 143);
export const red400 = color(243, 106, 106);
export const red500 = color(240, 69, 69);
export const red600 = color(192, 55, 55);
export const red700 = color(144, 41, 41);
export const red800 = color(96, 28, 28);
export const red900 = color(48, 14, 14);

//
// dark shades
//
export const dark50 = color(249, 248, 251);
export const dark100 = color(242, 241, 248);
export const dark200 = color(229, 228, 241);
export const dark300 = color(198, 197, 221);
export const dark400 = color(155, 154, 172);
export const dark500 = color(106, 104, 133);
export const dark600 = color(41, 40, 58);
export const dark700 = color(27, 26, 40);
export const dark800 = color(20, 19, 30);

//
// Opacity
//
export const weakOpacity: Opacity = 0.08;
export const normalOpacity: Opacity = 0.4;
export const strongOpacity: Opacity = 0.65;
export const boldOpacity: Opacity = 0.8;

//
// shadows
//
export const smallShadow = transparency(black, 0.06);
export const mediumShadow = transparency(black, 0.08);
