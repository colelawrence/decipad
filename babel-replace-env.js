//
// Hacky way to turn `import.meta.env` into `{}`
//

module.exports = function ({ types: t }) {
  return {
    visitor: {
      MemberExpression(path) {
        // Check if the object is `import.meta` and the property being accessed is `env`
        if (
          t.isMetaProperty(path.node.object) &&
          path.node.object.meta.name === 'import' &&
          path.node.object.property.name === 'meta' &&
          path.node.property.name === 'env'
        ) {
          // Replace `import.meta.env` with `{}`
          path.replaceWith(t.objectExpression([]));
        }
      },
    },
  };
};
