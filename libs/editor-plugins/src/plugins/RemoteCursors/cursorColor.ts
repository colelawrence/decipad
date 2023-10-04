import {
  OpaqueColor,
  blue400,
  brand400,
  orange400,
  purple400,
  red400,
  teal400,
  yellow500,
} from '@decipad/ui';

const colors = [
  orange400,
  red400,
  blue400,
  brand400,
  purple400,
  teal400,
  yellow500,
];

export const cursorColor = (clientID: number): OpaqueColor => {
  return colors[clientID % colors.length];
};
