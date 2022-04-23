/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PermissionType } from './../../../../../__generated__/globalTypes';

// ====================================================
// GraphQL query operation: GetPadById
// ====================================================

export interface GetPadById_getPadById_access_users_user {
  __typename: 'User';
  id: string;
  name: string;
}

export interface GetPadById_getPadById_access_users {
  __typename: 'UserAccess';
  user: GetPadById_getPadById_access_users_user;
  permission: PermissionType;
}

export interface GetPadById_getPadById_access_secrets {
  __typename: 'SecretAccess';
  permission: PermissionType;
  secret: string;
}

export interface GetPadById_getPadById_access {
  __typename: 'PadAccess';
  users: GetPadById_getPadById_access_users[];
  secrets: GetPadById_getPadById_access_secrets[];
}

export interface GetPadById_getPadById_workspace {
  __typename: 'Workspace';
  id: string;
  name: string;
}

export interface GetPadById_getPadById {
  __typename: 'Pad';
  id: string;
  name: string;
  myPermissionType: PermissionType;
  icon: string | null;
  access: GetPadById_getPadById_access;
  workspace: GetPadById_getPadById_workspace;
}

export interface GetPadById {
  getPadById: GetPadById_getPadById | null;
}

export interface GetPadByIdVariables {
  id: string;
}
