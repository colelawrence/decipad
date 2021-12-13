/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PermissionType } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: SharePadWithSecret
// ====================================================

export interface SharePadWithSecret {
  sharePadWithSecret: string;
}

export interface SharePadWithSecretVariables {
  id: string;
  permissionType: PermissionType;
  canComment: boolean;
}
