import { AST } from '..';
import { ParserNode } from './types';

const typesWithArgs = new Set<AST.Node['type']>([
  'argument-list',
  'function-call',
  'assign',
  'table-column-assign',
  'categories',
  'matrix-ref',
  'matrix-assign',
  'argument-names',
  'function-definition',
  'block',
  'column',
  'column-items',
  'table',
  'table-column',
  'table-spread',
  'generic-list',
  'range',
  'sequence',
]);

export function sourceMapDecorator(
  source: string
): (nodes: ParserNode) => AST.Block {
  const lines: string[] = source.split('\n');
  const locationToLine: Array<[number, number]> = [];
  const lineToLocation: Array<[number, number]> = [];

  let line = 0;
  let location = 0;
  for (const l of lines) {
    line++;
    lineToLocation.push([line, location]);
    location += l.length + 1;
    locationToLine.push([location - 1, line]);
  }

  return (block: ParserNode) => decorateNode(block) as AST.Block;

  function decorateNode(node: ParserNode): AST.Node {
    const line = findBorder(locationToLine, node.start as unknown as number);
    const column =
      (node.start as unknown as number) - findBorder(lineToLocation, line) + 1;

    node.start = {
      char: node.start as unknown as number,
      line,
      column,
    };

    const endChar = node.end as unknown as number;
    const endLine = findBorder(locationToLine, endChar);
    const endColumn = endChar - findBorder(lineToLocation, endLine) + 1;
    node.end = {
      char: endChar,
      line: endLine,
      column: endColumn,
    };

    if (typesWithArgs.has(node.type as AST.Node['type'])) {
      node.args = (node.args as AST.Node[]).map((node: unknown) =>
        decorateNode(node as ParserNode)
      ) as ParserNode[];
    } else if (node.type === 'property-access') {
      node.args[0] = decorateNode(node.args[0] as ParserNode);
    } else if (node.type === 'directive') {
      const [type, ...rest] = node.args as ParserNode[];
      node.args = [type, ...rest.map(decorateNode)] as AST.Node[];
    }

    return node as unknown as AST.Node;
  }
}

function findBorder(map: Array<[number, number]>, i: number): number {
  for (const [k, v] of map) {
    if (i <= k) {
      return v;
    }
  }
  return -1;
}
