import { ELEMENT_FREEDRAW, DrawElementDescendant } from '@decipad/editor-types';
import { nanoid } from 'nanoid';

export const drawDummyElement = (): DrawElementDescendant => ({
  type: ELEMENT_FREEDRAW,
  id: nanoid(),
  points: [],
  pressures: [],
  __dummy: true,
  children: [{ text: '' }],
  x: 364.55470275878906,
  y: 92.64584350585938,
  width: 118.0859375,
  height: 116.72393798828125,
  angle: 0,
  strokeColor: '#000000',
  backgroundColor: 'transparent',
  fillStyle: 'hachure',
  strokeWidth: 1,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  groupIds: [],
});
