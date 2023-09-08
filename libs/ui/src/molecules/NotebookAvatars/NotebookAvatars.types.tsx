import { OpaqueColor } from '../../primitives';

export interface Cursor {
  data: Data;
}
export interface Data {
  user: User;
  style: Style;
}
export interface User {
  email?: string;
}
export interface Style {
  _backgroundColor: OpaqueColor;
}
