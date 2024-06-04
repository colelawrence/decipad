import { escape } from 'html-escaper';
import type { AST } from '@decipad/language-interfaces';
import type { Computer } from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import type { FullBuiltinSpec, Time } from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import { getDateFromAstForm, operators } from '@decipad/language';
import { formatDate } from '@decipad/utils';
import { getIdentifierString } from '../utils/many';

const blockToML = async (
  block: AST.Block,
  computer: Computer
): Promise<string> => {
  return (
    await Promise.all(block.args.map(async (s) => statementToML(s, computer)))
  )
    .map((statememtML) => `<mrow>${statememtML}</mrow>`)
    .join('\n');
};

const functionDefinitionToML = async (
  funcDef: AST.FunctionDefinition,
  computer: Computer
): Promise<string> => {
  const funcName = getIdentifierString(funcDef.args[0]);
  const realFuncName =
    (funcName && computer.latestExprRefToVarNameMap.get(funcName)) ?? funcName;
  return `<mrow>
    <mi>${realFuncName}</mi>
    <mo fence="true">(</mo>
      ${funcDef.args[1].args
        .map((arg) => `<mi>${escape(getIdentifierString(arg))}</mi>`)
        .join('<mo>,</mo><mspace />')}
    <mo fence="true">)</mo>
    <mspace />
    <mo>=</mo>
    <mspace />
    ${await blockToML(funcDef.args[2], computer)}
  </mrow>`;
};

const defaultFuncitonCallToML = async (
  opName: string,
  args: AST.ArgList,
  computer: Computer
) => {
  const argsML = (
    await Promise.all(
      args.args.map(async (arg) => expressionToML(arg, computer))
    )
  ).join('<mo>,</mo><mspace />');
  return `<mrow>
    <mo>${escape(opName)}</mo>
    <mo fence="true">(</mo>
      ${argsML}
    <mo fence="true">)</mo>
  </mrow>`;
};

const functionCallToML = async (
  fCall: AST.FunctionCall,
  computer: Computer
): Promise<string> => {
  const [fRef, args] = fCall.args;
  const originalFunctionName = getIdentifierString(fRef);
  let op = operators[originalFunctionName];
  while (op?.aliasFor) {
    op = operators[op.aliasFor];
  }
  const builtinSpec = op as FullBuiltinSpec | undefined;
  if (builtinSpec) {
    return (
      builtinSpec.toMathML?.(
        await Promise.all(
          args.args.map(async (arg) => expressionToML(arg, computer))
        )
      ) ?? defaultFuncitonCallToML(originalFunctionName, args, computer)
    );
  }
  return '';
};

const defaultFormatForSpecificity = (s: Time.Specificity) => {
  switch (s) {
    case 'year':
      return 'yyyy';
    case 'quarter':
      return "yyyy'Q'q";
    case 'month':
      return 'yyyy-MM';
    case 'day':
      return 'yyyy-MM-dd';
    case 'hour':
      return 'yyyy-MM-dd HH';
    case 'minute':
      return 'yyyy-MM-dd HH:mm';
    default:
      return 'yyyy-MM-dd HH:mm:ss';
  }
};

export const expressionToML = async (
  expression: AST.Expression,
  computer: Computer
): Promise<string> => {
  switch (expression?.type) {
    case 'ref': {
      return `<mi>${expression.previousVarName ?? expression.args[0]}</mi>`;
    }
    case 'function-call': {
      return functionCallToML(expression, computer);
    }
    case 'date': {
      const [dateMs, specificity] = getDateFromAstForm(expression.args);
      if (dateMs == null) {
        return '<mo>date()<mo>';
      }
      return `<mo>date(${formatDate(
        dateMs,
        defaultFormatForSpecificity(specificity)
      )})<mo>`;
    }
    case 'literal': {
      const litArgs = expression.args;
      switch (litArgs[0]) {
        case 'string': {
          return `<mo fence="true">"</mo>
            <ms>${escape(litArgs[1])}</ms>
            <mo fence="true">"</mo>`;
        }
        case 'number': {
          const n = litArgs[1];
          if (n.d === 1n) {
            return `<mn>${escape(n.toString())}</mn>`;
          }
          const parts: string[] = [];
          if (n.s === -1n) {
            parts.push('<mo>-</mo>');
          }
          parts.push(`<mfrac>
            <mrow>
              <mn>${escape(n.n?.toString() ?? '')}</mn>
            </mrow>
            <mrow>
              <mn>${escape(n.d?.toString() ?? '')}</mn>
            </mrow>
          </mfrac>`);
          return parts.join('');
        }
        case 'boolean': {
          return `<mo fence="true">(</mo>
            <mo>${litArgs[1] ? 'true' : 'false'}</mo>
            <mo fence="true">)</mo>`;
        }
      }
    }
  }
  return '';
};

export const statementToML = async (
  statement: AST.Statement,
  computer: Computer
): Promise<string> => {
  switch (statement?.type) {
    case 'function-definition':
      return functionDefinitionToML(statement, computer);
    case 'assign':
      break;
    case 'table-column-assign':
      break;
    case 'table':
      break;
    case 'matrix-assign':
      break;
    case 'categories':
      break;
    default:
      return expressionToML(statement, computer);
  }
  return '';
};
