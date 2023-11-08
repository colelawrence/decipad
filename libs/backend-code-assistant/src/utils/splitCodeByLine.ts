import { SplitCodeResult, CodeResult } from '../types';

const structureLine = (line: string): CodeResult => {
  const equalIndex = line.indexOf('=');
  if (equalIndex < 0) {
    return {
      type: 'expression',
      expressionCode: line,
    };
  }
  const [varname, ...expression] = line.split('=');
  return {
    type: 'assignment',
    varname,
    value: expression.join('='),
  };
};

export const splitCodeByLine = (code: string): SplitCodeResult => {
  const lines = code.split('\n').filter(Boolean);

  return {
    error: undefined,
    blocks: lines.map(structureLine),
  };
};
