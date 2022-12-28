import {
  getVariableValidationErrorMessage,
  variableValidationErrors,
} from './useRevertBadNames';

it('validates variable taking into account the old name', () => {
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      oldVarName: 'bar',
      varExists: false,
      oldVarExists: false,
    })
  ).toEqual([false, undefined]);

  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      oldVarName: 'bar',
      varExists: true,
      oldVarExists: false,
    })
  ).toEqual([true, variableValidationErrors.varExists('foo')]);

  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      oldVarName: 'bar',
      varExists: false,
      oldVarExists: true,
    })
  ).toEqual([false, undefined]);

  // Was already bad, stayed bad
  // Do not revert but show error msg
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      oldVarName: 'bar',
      varExists: true,
      oldVarExists: true,
    })
  ).toEqual([false, variableValidationErrors.varExists('foo')]);

  // Became empty
  expect(
    getVariableValidationErrorMessage({
      varName: '',
      oldVarName: 'bar',
      varExists: false,
      oldVarExists: false,
    })
  ).toEqual([true, variableValidationErrors.varEmpty]);

  // Became empty but used to be invalid
  expect(
    getVariableValidationErrorMessage({
      varName: '',
      oldVarName: 'bar',
      varExists: false,
      oldVarExists: true,
    })
  ).toEqual([false, variableValidationErrors.varEmpty]);

  // Became filled
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      oldVarName: '',
      varExists: false,
      oldVarExists: false,
    })
  ).toEqual([false, undefined]);

  // Became filled but now it's invalid
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo',
      oldVarName: '',
      varExists: true,
      oldVarExists: false,
    })
  ).toEqual([true, variableValidationErrors.varExists('foo')]);
});

it('but first and foremost, checks if it is a valid identifier', () => {
  expect(
    getVariableValidationErrorMessage({
      varName: 'foo bar',
      oldVarName: 'bar',
      varExists: false,
      oldVarExists: false,
    })
  ).toEqual([true, variableValidationErrors.varInvalid]);
});
