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
export type Opacity = 0 | 0.02 | 0.04 | 0.08 | 0.16 | 0.4 | 0.65 | 0.8 | 1;
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
export const purple100 = color(227, 225, 254);
export const purple200 = color(199, 195, 253);
export const purple300 = color(171, 165, 252);
export const purple400 = color(143, 135, 251);
export const purple500 = color(115, 105, 250);
export const purple600 = color(92, 84, 200);
export const purple700 = color(69, 63, 150);
export const purple800 = color(46, 42, 100);
export const purple900 = color(23, 21, 50);

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
// red
//
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
// sulu
//
export const sulu700 = color(111, 167, 27);
export const sulu900 = color(59, 97, 2);

//
// pink
//
export const pink200 = color(251, 218, 225);
export const pink700 = color(145, 102, 111);
export const pink900 = color(78, 45, 52);

//
// perfume
//
export const perfume200 = color(193, 199, 248);
export const perfume700 = color(98, 106, 169);
export const perfume900 = color(48, 56, 125);

//
// malibu
//
export const malibu200 = color(141, 178, 251);
export const malibu700 = color(97, 139, 220);
export const malibu900 = color(44, 84, 164);

//
// sun
//
export const sun500 = color(255, 220, 66);
export const sun700 = color(131, 116, 36);
export const sun900 = color(77, 67, 15);

//
// lavender
//
export const lavender000 = color(95, 100, 134);

//
// Opacity
//
export const weakOpacity: Opacity = 0.08;
export const normalOpacity: Opacity = 0.4;
export const strongOpacity: Opacity = 0.65;
