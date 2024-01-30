import { PermissionType, UserAccess } from '@decipad/graphql-client';
import { ReactNode } from 'react';
import { TColorStatus } from '../../../utils';

export interface Authors {
  readonly adminName: string | undefined;
  readonly invitedUsers: Array<UserAccess>;

  readonly isWriter: boolean;
}

export interface AccessInfo {
  readonly isAuthenticated: boolean;
  readonly isSharedNotebook: boolean;
  readonly hasWorkspaceAccess: boolean;
  readonly permissionType?: PermissionType;

  readonly isGPTGenerated: boolean;
}

export interface TopbarActions {
  // Callback for clicking the back button.
  readonly onBack: () => void;
  readonly onGalleryClick: () => void;
  readonly onToggleSidebar: () => void;
  readonly onTryDecipadClick: () => void;
  readonly onClaimNotebook: () => void;
  readonly onDuplicateNotebook: () => void;

  // info
  readonly isSidebarOpen: boolean;
}

export type TopbarGenericProps = {
  // Composition props;
  readonly NotebookOptions: ReactNode;
  readonly UndoButtons: ReactNode;
  readonly AiModeSwitch: ReactNode;
  readonly NotebookPublishing: ReactNode;

  readonly access: AccessInfo;
  readonly actions: TopbarActions;
  readonly authors: Authors;

  readonly isEmbed: boolean;

  readonly status: TColorStatus | 'Archived';
};
