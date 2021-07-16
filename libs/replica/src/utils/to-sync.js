import Automerge from 'automerge';

export function toSync(node) {
  if (!node) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(toSync);
  }

  if (Object.prototype.hasOwnProperty.call(node, 'text')) {
    return {
      ...node,
      text: new Automerge.Text(node.text),
    };
  } else if (node.children) {
    return {
      ...node,
      children: node.children.map(toSync),
    };
  }

  return node;
}
