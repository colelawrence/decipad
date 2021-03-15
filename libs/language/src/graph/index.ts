import { walk, walkSkip } from "../utils";

interface GraphNode {
  deps: string[];
  exports: string[];
  funcExports: string[];
}

export const getExternalScope = (ast: AST.Node): GraphNode => {
  const deps: string[] = [];
  const exports: string[] = [];
  const funcExports: string[] = [];

  walk(ast, (node, depth) => {
    if (node.type === "ref") {
      deps.push(node.args[0]);
    }

    if (depth === 1 && node.type === "assign") {
      exports.push(node.args[0].args[0]);
    }

    if (node.type === "function-definition") {
      funcExports.push(node.args[0].args[0]);
      return walkSkip;
    }

    /* eslint-disable-next-line no-useless-return */
    return;
  });

  return { deps, exports, funcExports };
};
