const template = (variables, { tpl }) => {
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
