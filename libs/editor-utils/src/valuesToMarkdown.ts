import {
  InlineChildren,
  InlineDescendant,
  MyValue,
  TopLevelValue,
} from '@decipad/editor-types';

export const inlineChildToString = (
  child: InlineChildren | InlineDescendant
): string => {
  if (Array.isArray(child)) {
    return child.map(inlineChildToString).join('');
  }
  if (!('type' in child)) {
    let { text } = child;
    if (child.bold) {
      text = `**${child.text}**`;
    }
    if (child.italic) {
      text = `*${child.text}*`;
    }
    if (child.strikethrough) {
      text = `~~${child.text}~~`;
    }
    return text;
  }
  switch (child.type) {
    case 'a': {
      return `[${inlineChildrenToString(child.children)}](${child.url})`;
    }
    case 'inline-number': {
      return inlineChildrenToString(child.children);
    }
    case 'smart-ref': {
      return child.lastSeenVariableName || child.id; // not sure id is the right behaviour here...
    }
  }
};

const inlineChildrenToString = (children: InlineChildren): string => {
  return children.reduce((str, value) => {
    return `${str}${inlineChildToString(value)}`;
  }, '');
};

// elements that should be wrapped in ```decilang tags
const decilangElementTypes: TopLevelValue['type'][] = [
  'code_line',
  'code_line_v2',
  'def',
  'table',
];

export const isDecilangValue = (value: MyValue[number]): boolean => {
  return decilangElementTypes.includes(value.type);
};

const valuetoUnwrappedMarkup = (value: TopLevelValue): string => {
  switch (value.type) {
    case 'p': {
      return `${inlineChildrenToString(value.children)}\n`;
    }
    case 'h1': {
      return `# ${value.children[0].text}\n`;
    }
    case 'h2': {
      return `## ${value.children[0].text}\n`;
    }
    case 'h3': {
      return `### ${value.children[0].text}\n`;
    }
    case 'ul': {
      const listString = value.children
        .map((li) => {
          return `* ${inlineChildToString(li.children[0].children)}`;
        })
        .join('\n');
      return `${listString}\n`;
    }
    case 'ol': {
      const listString = value.children
        .map((li, i) => `${i + 1}. ${li.children[0].children[0].text}`)
        .join('\n');
      return `${listString}\n`;
    }
    case 'blockquote': {
      return inlineChildrenToString(value.children).replace(/^/gm, '> ');
    }
    case 'code_line': {
      return inlineChildrenToString(value.children);
    }
    case 'code_line_v2': {
      const [varNameEl, codeEl] = value.children;
      const varName = varNameEl.children[0].text;
      const code = inlineChildToString(codeEl.children[0]);
      return `${varName} = ${code}`;
    }
    case 'def': {
      const [captionEl, exprOrDropdownEl] = value.children;
      const kind = value.coerceToType?.kind;
      const name = captionEl.children[0].text;
      const val = exprOrDropdownEl.children[0].text;
      let valStr: string;
      switch (kind) {
        case 'boolean': {
          valStr = val === 'true' ? 'true' : 'false';
          break;
        }
        case 'string': {
          valStr = `"${val}"`;
          break;
        }
        default: {
          valStr = val;
        }
      }
      return `${name} = ${valStr}`;
    }
    case 'table': {
      const [tableCaptionEl, headerRowEl, ...rowEls] = value.children;
      const [tableVariableNameEl, ...tableColumnFnEls] =
        tableCaptionEl.children;

      const tableName = tableVariableNameEl.children[0].text;

      const fnDict: { [columnId: string]: string } = {};

      tableColumnFnEls.forEach((x) => {
        const { columnId, children } = x;
        const formula = inlineChildrenToString(children);
        fnDict[columnId] = formula;
      });

      const columns = headerRowEl.children.map((headerEl, colIndex) => {
        const colName = headerEl.children[0].text;
        const { cellType } = headerEl;

        const fn = fnDict[headerEl.id];
        if (fn !== undefined) {
          return `${colName} = ${fn}`;
        }

        const columnValues = [];
        for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
          let cellContent =
            rowEls[rowIndex].children[colIndex].children[0].text;

          switch (cellType.kind) {
            case 'boolean': {
              cellContent = cellContent === 'true' ? 'true' : 'false';
              break;
            }
            case 'string': {
              cellContent = `"${cellContent}"`;
              break;
            }
            default: {
              break;
            }
          }

          columnValues.push(cellContent);
        }
        return `${colName} = [${columnValues.join(', ')}]`;
      });

      return `${tableName} = {\n  ${columns.join('\n  ')}\n}`;
    }
    default: {
      return '';
    }
  }
};

const wrapDecilangString = (s: string) => {
  return `\`\`\`decilang\n${s}\n\`\`\``;
};

export const valueToMarkup = (value: TopLevelValue): string => {
  const unwrappedMarkup = valuetoUnwrappedMarkup(value);
  return isDecilangValue(value)
    ? wrapDecilangString(unwrappedMarkup)
    : unwrappedMarkup;
};

/**
 * Prepend lines of a string with line numbers.
 * The line numbers are right-aligned and a pipe character is added after the line number.
 * */
function prependLinesWithNumbers(input: string) {
  const lines = input.split('\n');
  const padding = lines.length.toString().length;

  for (let i = 0; i < lines.length; i += 1) {
    const lineNumber = (i + 1).toString().padStart(padding, ' ');
    lines[i] = `${lineNumber} | ${lines[i]}`;
  }

  return lines.join('\n');
}

type ValuesToMarkdownOptions = {
  lineNumbers: boolean;
  toJavaScript: boolean;
};

export const valuesToMarkdown = (
  values: MyValue,
  options: ValuesToMarkdownOptions = { lineNumbers: true, toJavaScript: false }
): string => {
  let string: string = '';
  let prevValueIsDecilang = false;

  for (const value of values) {
    const valueStr = valueToMarkup(value);
    const currentValueIsDecilang = isDecilangValue(value);

    // Merge contiguous lines of Decipad code together to remove ```s
    if (currentValueIsDecilang && prevValueIsDecilang) {
      string = `${string.replace(/\n.+$/, '')}\n${valueStr.replace(
        /^.+\n/,
        ''
      )}`;
      continue;
    }

    string = `${string}\n${valueStr}`;
    prevValueIsDecilang = currentValueIsDecilang;
  }
  return options.lineNumbers
    ? prependLinesWithNumbers(string.trim())
    : string.trim();
};
