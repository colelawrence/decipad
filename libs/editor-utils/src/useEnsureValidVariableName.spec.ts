import {
  getVariableValidationErrorMessage,
  variableValidationErrors,
} from './useEnsureValidVariableName';

it('validates variable taking into account the old name', () => {
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      varExists: false,
    })
  ).toEqual(undefined);

  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      varExists: true,
    })
  ).toEqual(variableValidationErrors.varExists('foo'));

  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      varExists: false,
    })
  ).toEqual(undefined);

  // Became empty
  expect(
    getVariableValidationErrorMessage({
      varName: '',
      varExists: false,
    })
  ).toEqual(variableValidationErrors.varEmpty);

  // Became filled
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      varExists: false,
    })
  ).toEqual(undefined);

  // Became filled but now it's invalid
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      varExists: true,
    })
  ).toEqual(variableValidationErrors.varExists('foo'));
});

it('but first and foremost, checks if it is a valid identifier', () => {
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo bar',
      varExists: false,
    })
  ).toEqual(variableValidationErrors.varInvalid);
});
