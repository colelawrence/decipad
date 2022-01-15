import { Parser } from 'htmlparser2';
import { DomHandler, NodeWithChildren, DataNode } from 'domhandler';

type Node = NodeWithChildren & DataNode & { name: string };

type SimpleNode = [string, SimpleNode[] | string];

const skipTagNames = new Set(['div', 'span', 'path']);

export type { Node, SimpleNode };

function getChildren(node: Node): SimpleNode[] {
  return (
    node.children
      .filter((_child) => {
        const child = _child as Node;
        return Boolean(child.data) || (child.children || []).length > 0;
      })
      // eslint-disable-next-line no-use-before-define
      .map((child) => simplifyHTML(child as Node))
  );
}

export function simplifyHTML(html: Node): SimpleNode {
  if (skipTagNames.has(html.name)) {
    if ((html.children || []).length === 1) {
      return simplifyHTML(html.children[0] as Node);
    }
  }
  return [html.name || 'text', html.children ? getChildren(html) : html.data];
}

export function parseHTML(html: string): Promise<Node[]> {
  return new Promise((resolve, reject) => {
    const handler = new DomHandler((err, dom) => {
      if (err) {
        reject(err);
      }
      resolve(dom as Node[]);
    });
    const parser = new Parser(handler);
    parser.write(html);
    parser.end();
  });
}
