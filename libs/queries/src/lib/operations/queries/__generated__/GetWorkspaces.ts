/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetWorkspaces
// ====================================================

export interface GetWorkspaces_workspaces_pads_items {
  __typename: 'Pad';
  id: string;
  name: string;
  createdAt: any | null;
}

export interface GetWorkspaces_workspaces_pads {
  __typename: 'PagedPadResult';
  items: GetWorkspaces_workspaces_pads_items[];
}

export interface GetWorkspaces_workspaces {
  __typename: 'Workspace';
  id: string;
  name: string;
  pads: GetWorkspaces_workspaces_pads;
}

export interface GetWorkspaces {
  workspaces: GetWorkspaces_workspaces[];
}
