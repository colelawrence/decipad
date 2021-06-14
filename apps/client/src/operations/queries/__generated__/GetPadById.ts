/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPadById
// ====================================================

export interface GetPadById_getPadById {
  __typename: 'Pad';
  id: string;
  name: string;
}

export interface GetPadById {
  getPadById: GetPadById_getPadById | null;
}

export interface GetPadByIdVariables {
  id: string;
}
