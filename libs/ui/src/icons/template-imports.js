const path = require('path');

function indexTemplate(files) {
  const exportEntries = files.map(({ path: file }) => {
    const basename = path.basename(file, path.extname(file));
    const exportName = /^\d/.test(basename) ? `Svg${basename}` : basename;
    return `export { ${exportName} } from './${basename}';`;
  });
  return exportEntries.join('\n');
}

module.exports = indexTemplate;
