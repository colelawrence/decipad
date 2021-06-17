/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateWorkspace
// ====================================================

export interface CreateWorkspace_createWorkspace {
  __typename: 'Workspace';
  id: string;
  name: string;
}

export interface CreateWorkspace {
  createWorkspace: CreateWorkspace_createWorkspace;
}

export interface CreateWorkspaceVariables {
  name: string;
}
