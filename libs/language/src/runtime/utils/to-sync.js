import Automerge from 'automerge';

function toSync(node) {
  if (!node) {
    return;
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

export { toSync };
