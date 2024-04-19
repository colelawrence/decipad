import { grey500, transparency } from './color';

const shadow1 = transparency(grey500, 0.02).rgba;
const shadow2 = transparency(grey500, 0.08).rgba;

export const normalShadow = `0px 1px 2px ${shadow1}, 0px 2px 12px ${shadow2}`;
