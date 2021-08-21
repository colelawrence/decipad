/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RenameWorkspace
// ====================================================

export interface RenameWorkspace_updateWorkspace {
  __typename: "Workspace";
  id: string;
  name: string;
}

export interface RenameWorkspace {
  updateWorkspace: RenameWorkspace_updateWorkspace;
}

export interface RenameWorkspaceVariables {
  id: string;
  name: string;
}
