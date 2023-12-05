import unified from 'unified';
import visit from 'unist-util-visit';
import type { Root, Code } from 'mdast';
import remarkParse from 'remark-parse';
import { parser } from '@lezer/javascript';

export const addEnvVars = (js: string, envVars: Map<string, string>) => {
  const processString = `const process = {
  env: { 
${Array.from(envVars)
  .map(([key, value]) => `    ${key}: "{{{secrets.${value}}}}"`)
  .join(',\n')}
  }
};`;
  return `${processString}\n\n${js}`;
};

type JsDocParams = {
  [key: string]: {
    type: string;
    description: string;
  };
};

export const parseJsDoc = (docString: string) => {
  const map: JsDocParams = {};
  // get params from docstring
  const paramsRegex = /@param {([^}]+)} ([^ ]+) (.+)/g;
  let match;
  while ((match = paramsRegex.exec(docString))) {
    const [, type, name, description] = match;
    map[name] = { type, description };
  }
  return map;
};

const insertStringAt = (
  originalString: string,
  index: number,
  stringToInsert: string
) => {
  return (
    originalString.slice(0, index) +
    stringToInsert +
    originalString.slice(index)
  );
};

export type JsIntegrationMessageData = {
  fnName: string;
  jsDocParams: JsDocParams;
  envVars: string[];
  params: string[];
  functionBody: string;
};
export type IntegrationMessageData = JsIntegrationMessageData & {
  content: string;
};

// eslint-disable-next-line complexity
export const parseIntegrationJs = (
  js: string
): JsIntegrationMessageData | null => {
  const ast = parser.parse(js);
  const cursor = ast.cursor();
  cursor.firstChild(); // down to variable declaration
  let fnName: string;
  const envVars = new Set<string>();
  const params = new Set<string>();
  let jsDocParams: JsDocParams = {};
  let functionBody: string;

  do {
    if (cursor.name === 'BlockComment') {
      jsDocParams = parseJsDoc(js.substring(cursor.from, cursor.to));
    }

    if (
      cursor.name === 'FunctionDeclaration' ||
      cursor.name === 'VariableDeclaration'
    ) {
      cursor.firstChild();
      do {
        // VariableDefinition
        if ((cursor.name as string) === 'VariableDefinition') {
          fnName = js.substring(cursor.from, cursor.to);
        }
        // ParamList
        if ((cursor.name as string) === 'ParamList') {
          cursor.firstChild();
          do {
            if ((cursor.name as string) === 'VariableDefinition') {
              params.add(js.substring(cursor.from, cursor.to));
            }
          } while (cursor.nextSibling());
          cursor.parent();
        }
        // FunctionDefinition
        if (
          (cursor.name as string) === 'ArrowFunction' ||
          (cursor.name as string) === 'FunctionExpression'
        ) {
          cursor.firstChild();
        }
        // Block
        if ((cursor.name as string) === 'Block') {
          functionBody = js.substring(cursor.from, cursor.to);
          const fnBodyAst = parser.parse(functionBody);
          const fnBodyCursor = fnBodyAst.cursor();
          // replace all uses of params with this.param
          const variableUseIndices: number[] = [];
          do {
            if (fnBodyCursor.name !== 'VariableName') continue;
            const varName = functionBody.substring(
              fnBodyCursor.from,
              fnBodyCursor.to
            );
            if (!params.has(varName)) continue;
            variableUseIndices.push(fnBodyCursor.from);
          } while (fnBodyCursor.next());

          variableUseIndices.reverse();
          for (const index of variableUseIndices) {
            functionBody = insertStringAt(functionBody, index, 'this.');
          }
        }
      } while (cursor.nextSibling());

      // Get env vars
      do {
        const cursorText = js.substring(cursor.from, cursor.to);
        if (
          (cursor.name as string) !== 'MemberExpression' ||
          cursorText !== 'process.env'
        )
          continue;
        cursor.nextSibling();
        cursor.nextSibling();
        const envVarString = js.substring(cursor.from, cursor.to);
        envVars.add(envVarString);
      } while (cursor.next());
    }
  } while (cursor.nextSibling());

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (typeof fnName! !== 'string') return null;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (typeof functionBody! !== 'string') return null;

  return {
    fnName,
    jsDocParams,
    envVars: Array.from(envVars),
    params: Array.from(params),
    functionBody: functionBody?.replace(/^\s*\{\s*|\s*\}\s*$/g, ''), // replace opening and closing braces
  };
};

export const parseIntegration = async (
  str: string
): Promise<IntegrationMessageData | null> => {
  const root = unified().use(remarkParse).parse(str) as Root;

  const codeblocks: Code[] = [];
  visit<Code>(root, 'code', (code) => {
    codeblocks.push(code);
  });

  if (codeblocks.length !== 1) {
    return null;
  }

  const codeblock = codeblocks[0];
  const { position } = codeblock;
  if (!position) {
    return null;
  }

  // Split text into before code and code (throw away after code)
  const beforeCode = str.slice(0, position.start.offset);
  let code = str.slice(position.start.offset, position.end.offset);
  // Remove first and last line of code
  const codeLines = code.split('\n');
  codeLines.shift();
  codeLines.pop();
  code = codeLines.join('\n');

  // Parse the JavaScript
  const parsedJs = parseIntegrationJs(code);
  if (!parsedJs) return null;

  return {
    content: beforeCode,
    ...parsedJs,
  };
};
