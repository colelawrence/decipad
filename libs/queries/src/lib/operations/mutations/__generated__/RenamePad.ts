/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RenamePad
// ====================================================

export interface RenamePad_updatePad {
  __typename: "Pad";
  id: string;
  name: string;
}

export interface RenamePad {
  updatePad: RenamePad_updatePad;
}

export interface RenamePadVariables {
  padId: string;
  name: string;
}
