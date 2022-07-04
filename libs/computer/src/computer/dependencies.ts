import { unique } from '@decipad/utils';
import { AST } from '..';

export const dependencies = (node: AST.Node): string[] => {
  switch (node.type) {
    case 'argument-names':
    case 'catdef':
    case 'coldef':
    case 'date':
    case 'def':
    case 'externalref':
    case 'fetch-data':
    case 'funcdef':
    case 'generic-identifier':
    case 'literal':
    case 'noop': {
      return [];
    }
    case 'block':
    case 'argument-list':
    case 'column-items':
    case 'generic-list':
    case 'matrix-matchers':
    case 'range':
    case 'table':
    case 'table-column-assign':
    case 'table-spread': {
      return unique(node.args.flatMap(dependencies));
    }
    case 'assign':
    case 'categories': {
      return unique(node.args.slice(1).flatMap(dependencies));
    }
    case 'column':
    case 'property-access':
    case 'sequence': {
      return dependencies(node.args[0]);
    }
    case 'directive': {
      const [, ...args] = node.args;
      return unique(args.flatMap(dependencies));
    }
    case 'funcref': {
      return node.args;
    }
    case 'function-call': {
      const [funcName, argList] = node.args;
      return [
        ...dependencies(funcName),
        ...unique(argList.args.flatMap(dependencies)),
      ];
    }
    case 'function-definition': {
      const [name, args, body] = node.args;
      const argNames = dependencies(args);
      const bodyDeps = dependencies(body);
      const externalBodyDeps = bodyDeps.filter(
        (dep) => !argNames.includes(dep)
      );
      return [...dependencies(name), ...externalBodyDeps];
    }
    case 'matrix-assign': {
      const [, where, assignee] = node.args;
      return unique([...dependencies(where), ...dependencies(assignee)]);
    }
    case 'matrix-ref': {
      return unique(node.args.flatMap(dependencies));
    }
    case 'ref':
    case 'tablepartialdef': {
      return node.args;
    }
    case 'table-column': {
      const [, column] = node.args;
      return dependencies(column);
    }
  }
};
