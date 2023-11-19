const stripHeader = (str) => {
  const trimmed = str.trim();
  if (trimmed.startsWith('---')) {
    let pastHeader = false;
    return trimmed
      .split('\n')
      .slice(1)
      .filter((line) => {
        if (!pastHeader && line.startsWith('---')) {
          pastHeader = true;
          return false;
        }
        return pastHeader;
      })
      .join('\n');
  }
  return trimmed;
};

const stripImports = (str) => {
  return str
    .split('\n')
    .filter((line) => !line.startsWith('import '))
    .join('\n');
};

const stripImageAnnotation = (str) => {
  let open = false;
  return str
    .split('\n')
    .filter((line) => {
      if (line.startsWith('<')) {
        open = true;
      }
      if (open) {
        if (line.includes('\\>')) {
          open = false;
        }
        return false;
      }
      return !open;
    })
    .join('\n');
};

const preStrip = (str) => stripImageAnnotation(stripImports(stripHeader(str)));

const handleCode = (code) => {
  const lines = code.value.split('\n');
  const lastLine = lines.at(-1);
  if (lastLine && lastLine.startsWith('==>')) {
    return {
      ...code,
      value: lines.slice(0, -1).join('\n'),
      meta: null,
    };
  }
  return code;
};

exports.cleanMarkdown = async (markdown) => {
  const { remark } = await import('remark');
  const strip = (await import('strip-markdown')).default;
  return (
    await remark()
      .use(strip, {
        remove: ['html', ['code', handleCode]],
        keep: [
          'heading',
          'text',
          'inlineCode',
          'image',
          'imageReference',
          'break',
          'blockquote',
          'list',
          'listItem',
          'strong',
          'emphasis',
          'link',
          'linkReference',
          'thematicBreak',
          'table',
          'tableCell',
          'definition',
          'footnoteReference',
          'footnoteDefinition',
        ],
      })
      .process(preStrip(markdown))
  ).value;
};
