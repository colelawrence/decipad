import { ParserNode } from "./types";

const typesWithArgs = new Set([
  "argument-list",
  "function-call",
  "conditional",
  "assign",
  "argument-names",
  "function-definition",
  "block",
  "table-definition",
  "table-columns",
]);

export function sourceMapDecorator(
  source: string
): (nodes: ParserNode) => AST.Node {
  const lines: string[] = source.split("\n");
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

  return decorateNode;

  function decorateNode(node: ParserNode): AST.Node {
    // console.log(node)
    const line = findBorder(locationToLine, node.location as number);
    const column =
      (node.location as number) - findBorder(lineToLocation, line) + 1;

    node.start = {
      char: node.location as number,
      line,
      column,
    };

    const endChar = (node.location as number) + (node.length as number) - 1;
    const endLine = findBorder(locationToLine, endChar);
    const endColumn = endChar - findBorder(lineToLocation, endLine) + 1;
    node.end = {
      char: endChar,
      line: endLine,
      column: endColumn,
    };

    if (typesWithArgs.has(node.type)) {
      node.args = ((node.args as AST.Node[]).map((node: unknown) =>
        decorateNode(node as ParserNode)
      ) as unknown) as ParserNode[];
    } else if (node.type === "literal") {
      const n = (node as unknown) as AST.Literal;
      if (n.args[0] === "number") {
        const units = n.args[2];
        if (units !== null) {
          n.args[2] = (units.map((unit: unknown) =>
            decorateNode(unit as ParserNode)
          ) as unknown) as AST.Unit[];
        }
      }
    }

    delete node.location;
    delete node.length;

    return (node as unknown) as AST.Node;
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
