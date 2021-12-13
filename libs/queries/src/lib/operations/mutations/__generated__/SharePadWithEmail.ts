/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PermissionType } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: SharePadWithEmail
// ====================================================

export interface SharePadWithEmail {
  sharePadWithEmail: boolean | null;
}

export interface SharePadWithEmailVariables {
  id: string;
  email: string;
  permissionType: PermissionType;
  canComment: boolean;
}
