const t = require('@babel/types');

const template = (variables, { tpl }) => {
  const titleElement = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('title'), [], false),
    t.jsxClosingElement(t.jsxIdentifier('title')),
    [t.jsxText(variables.componentName.slice(3))],
    false
  );

  // Insert the title element at the beginning of the SVG element's children
  if (variables.jsx.openingElement.name.name === 'svg') {
    variables.jsx.children.unshift(titleElement);
  }

  // eslint-disable-next-line no-param-reassign
  variables.componentName = `${variables.componentName.slice(3)}`;

  // eslint-disable-next-line no-param-reassign
  variables.exports = tpl`
export default ${variables.componentName};
  `;

  return tpl`
${variables.imports};

${variables.interfaces}

export const ${variables.componentName} = (${variables.props}) => {
  return (
    ${variables.jsx}
  );
};
  `;
};

module.exports = template;
