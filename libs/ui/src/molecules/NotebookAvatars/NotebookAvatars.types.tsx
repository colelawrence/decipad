import { OpaqueColor } from '../../primitives';
import { PermissionType } from '../../types';

export interface NotebookAvatar {
  isTeamMember?: boolean;
  user: {
    id: string;
    name: string;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    onboarded?: boolean | null;
    emailValidatedAt?: Date | null;
  };
  permission: PermissionType;
  onClick?: () => void;
}

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
