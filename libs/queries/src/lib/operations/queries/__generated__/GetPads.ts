/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPads
// ====================================================

export interface GetPads_pads_items {
  __typename: "Pad";
  id: string;
  name: string;
}

export interface GetPads_pads {
  __typename: "PagedPadResult";
  items: GetPads_pads_items[];
}

export interface GetPads {
  pads: GetPads_pads;
}

export interface GetPadsVariables {
  workspaceId: string;
}
