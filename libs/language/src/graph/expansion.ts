import { produce } from 'immer';
import { nanoid } from 'nanoid';

import { n, walk, getDefined, getOfType, getIdentifierString } from '../utils';
import { builtins } from '../builtins';
import { getExternalScope } from './index';

const getExpandedFunctionArgument = (prefix: string, argName: string) =>
  `\0${prefix}\0${argName}`;
const isExpandedFunctionArgument = (refName: string) => refName[0] === '\0';

export const expandExpression = (
  blocks: AST.Block[],
  expression: AST.Node,
  expandRefs = true
): AST.Expression => {
  const graph = blocks.map((ast) => getExternalScope(ast));

  switch (expression.type) {
    case 'literal': {
      // Cannot be expanded at compile time
      return expression;
    }
    case 'conditional': {
      return produce(expression, (cond) => {
        for (let i = 0; i < cond.args.length; i++) {
          cond.args[i] = expandExpression(blocks, cond.args[i], expandRefs);
        }
      });
    }
    case 'ref': {
      const varName = getIdentifierString(expression);
      if (!expandRefs && !isExpandedFunctionArgument(varName)) {
        return expression;
      }

      const blockIndex = graph.findIndex(({ exports }) =>
        exports.includes(varName)
      );

      const { args: blockItems } = getOfType('block', blocks[blockIndex]);

      const assignTarget = getOfType(
        'assign',
        getDefined(
          blockItems.find(
            (node) =>
              node.type === 'assign' &&
              getIdentifierString(node.args[0]) === varName
          )
        )
      ).args[1];

      return expandExpression(blocks, assignTarget, expandRefs);
    }
    case 'function-call': {
      const [fName, fArgs] = expression.args;

      const fNameString = getIdentifierString(fName);

      if (fNameString in builtins.binary || fNameString in builtins.unary) {
        const expanded: AST.FunctionCall = {
          ...expression,
          args: [
            fName,
            n(
              'argument-list',
              ...fArgs.args.map((arg) =>
                expandExpression(blocks, arg, expandRefs)
              )
            ),
          ],
        };
        return expanded;
      }

      const blockIndex = graph.findIndex(({ funcExports }) =>
        funcExports.includes(fNameString)
      );
      const { args: blockItems } = getOfType('block', blocks[blockIndex]);
      const func = getOfType(
        'function-definition',
        getDefined(
          blockItems.find(
            (item) =>
              item.type === 'function-definition' && item.args[0].args[0]
          )
        )
      );

      const expandedFunctionDefinition = getHygienicFunctionExpansion(
        blocks,
        func,
        fArgs.args,
        expandRefs
      );

      // Append new body to blocks and evaluate the last item
      return expandedFunctionDefinition;
    }
    default: {
      throw new Error('unsupported: expanding ' + expression.type);
    }
  }
};

// Expand a function in a way that lets us inline it somewhere,
// without symbol collisions
const getHygienicFunctionExpansion = (
  blocks: AST.Block[],
  func: AST.FunctionDefinition,
  givenArguments: AST.Expression[],
  expandExternalRefs = true
): AST.Expression => {
  const [, fArgs, fBody] = func.args;

  const argNames = fArgs.args.map((arg) => getIdentifierString(arg));

  // The new argument names are impossible to parse, and scoped by the
  // function name, so they're safe from collisions
  const prefix = nanoid();
  const newArgNames = argNames.map((arg) =>
    getExpandedFunctionArgument(prefix, arg)
  );
  const expandedBody = produce(fBody, (fBody) => {
    const statements = fBody.args;

    for (let i = 0; i < argNames.length; i++) {
      statements.unshift(
        n('assign', n('def', newArgNames[i]), givenArguments[i])
      );
    }

    // Rename arguments
    walk(fBody, (node) => {
      if (node.type === 'ref' && argNames.includes(node.args[0])) {
        const argIndex = argNames.indexOf(node.args[0]);
        if (argIndex !== -1) {
          node.args[0] = newArgNames[argIndex];
        }
      }
    });
  });

  const lastStatement = expandedBody.args[expandedBody.args.length - 1];

  if (
    lastStatement.type === 'function-definition' ||
    lastStatement.type === 'table-definition' ||
    lastStatement.type === 'assign'
  ) {
    throw new Error(
      'panic: Illegal last item in a function: ' + lastStatement.type
    );
  }

  const returnedExpression: AST.Expression = lastStatement;

  return expandExpression(
    [...blocks, expandedBody],
    returnedExpression,
    expandExternalRefs
  );
};

export const expandStatement = (
  blocks: AST.Block[],
  statement: AST.Statement
) => {
  switch (statement.type) {
    case 'function-definition': {
      // Function definitions are not expanded themselves
      return null;
    }

    case 'table-definition': {
      // Assignments are preserved so that exports can be found afterwards.
      return produce(statement, (tableDef) => {
        const tableCols = tableDef.args[1];

        // Pairwise iteration
        for (let i = 0; i + 1 < tableCols.args.length; i += 2) {
          tableCols.args[i] = expandExpression(blocks, tableCols.args[i]);
        }
      });
    }

    case 'assign': {
      // Assignments are preserved so that exports can be found afterwards.
      return produce(statement, (assign) => {
        assign.args[1] = expandExpression(blocks, assign.args[1]);
      });
    }

    default: {
      // Every other case is a valid expandable expression
      const expression: AST.Expression = statement;

      return expandExpression(blocks, expression);
    }
  }
};

export const expandProgram = (blocks: AST.Block[]): AST.Block[] => {
  return blocks.map((block) => {
    const statements: AST.Statement[] = [];

    for (const statement of block.args) {
      const expanded = expandStatement(blocks, statement);
      if (expanded != null) {
        statements.push(expanded);
      }
    }

    return n('block', ...statements);
  });
};
