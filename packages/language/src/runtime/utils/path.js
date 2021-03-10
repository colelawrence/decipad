export const isTree = (node) =>
  Boolean(node && node.children);

export function getTarget(doc, path) {
  function iterate(current, idx) {
    if (!(isTree(current) || current[idx])) {
      throw new TypeError(
        `path ${path.toString()} does not match tree ${JSON.stringify(current)}`
      );
    }

    return current[idx] || (current && current.children[idx]);
  }

  return path.reduce(iterate, doc);
}

export function getParentPath(path, level = 1) {
  if (level > path.length) {
    throw new TypeError("requested ancestor is higher than root");
  }

  return [path[path.length - level], path.slice(0, path.length - level)];
}

export function getParent(doc, path, level = 1) {
  const [idx, parentPath] = getParentPath(path, level);
  return [getTarget(doc, parentPath), idx];
}

export const getChildren = (node) => node.children || node;
