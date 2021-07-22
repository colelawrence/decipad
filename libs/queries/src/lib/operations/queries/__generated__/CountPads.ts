/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CountPads
// ====================================================

export interface CountPads_pads {
  __typename: 'PagedPadResult';
  count: number;
}

export interface CountPads {
  pads: CountPads_pads;
}

export interface CountPadsVariables {
  workspaceId: string;
}
