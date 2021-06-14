/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetWorkspaceById
// ====================================================

export interface GetWorkspaceById_getWorkspaceById {
  __typename: 'Workspace';
  id: string;
  name: string;
}

export interface GetWorkspaceById {
  getWorkspaceById: GetWorkspaceById_getWorkspaceById | null;
}

export interface GetWorkspaceByIdVariables {
  id: string;
}
