/* eslint-disable import/no-relative-packages */
import { it, expect } from 'vitest';
import {
  IdentifiedError,
  IdentifiedResult,
  NotebookResults,
  deserializeType,
  materializeOneResult,
} from '@decipad/remote-computer';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import glob from 'glob';
import fs from 'fs';
import maxBy from 'lodash/maxBy';
import { formatError, formatResult } from '@decipad/format';
// eslint-disable-next-line no-restricted-imports
import {
  RuntimeError,
  createProgramFromMultipleStatements,
  getComputer,
} from '@decipad/computer';

const getRemark = () =>
  remark().use(remarkMdx).use(remarkGfm).use(remarkFrontmatter);

const snapshotSeparator = '\n==> ';

type CodeAndSnapshot = {
  code: string;
  snapshot: string;
};

const getCodeNodes = (doc: any): Array<CodeAndSnapshot> => {
  return doc.children
    .filter(
      ({ type, lang, meta }: any) =>
        type === 'code' && lang === 'deci' && meta === 'live'
    )
    .map((node: any) => {
      const [code, snapshot = '(no snapshot)'] =
        node.value.split(snapshotSeparator);

      return { code, snapshot };
    });
};

async function collectOneFile(
  fileName: string
): Promise<Map<string, Array<CodeAndSnapshot>>> {
  const theTests = fs.readFileSync(fileName, { encoding: 'utf-8' });
  const codeNodesPerFile = new Map<string, Array<CodeAndSnapshot>>();

  await getRemark()
    .use(() => (document) => {
      codeNodesPerFile.set(fileName, getCodeNodes(document));
    })
    .process(theTests);

  return codeNodesPerFile;
}

async function runAllFiles() {
  const files = glob.sync('./docs/**/*.md');

  const allFiles = await Promise.all(files.map(collectOneFile));
  const combinedMap = new Map<string, Array<CodeAndSnapshot>>();

  for (const file of allFiles) {
    for (const [key, value] of file.entries()) {
      combinedMap.set(key, value);
    }
  }

  return combinedMap;
}

const DEFAULT_LOCALE = 'en-US';

export const getMaxIdObject = (
  objects: Readonly<IdentifiedError | IdentifiedResult>[]
): Readonly<IdentifiedError | IdentifiedResult> | undefined => {
  return maxBy(objects, (obj) => Number(obj.id.split('_')[0]));
};

async function resultFromComputerResult(
  result: NotebookResults
): Promise<string> {
  for (const update of Object.values(result.blockResults)) {
    if (update.error) {
      return update.error.message;
    }
  }

  const lastResult = getMaxIdObject(Object.values(result.blockResults))?.result;
  if (!lastResult) {
    throw new Error(`could not find a result`);
  }

  if (lastResult.type.kind === 'type-error') {
    return formatError(DEFAULT_LOCALE, lastResult.type.errorCause);
  }

  return formatResult(
    DEFAULT_LOCALE,
    lastResult.value && (await materializeOneResult(lastResult.value)),
    deserializeType(lastResult.type)
  );
}

async function getDocTestString(codeExample: string): Promise<any> {
  try {
    const program = createProgramFromMultipleStatements(codeExample);
    const computer = getComputer();
    const result = await computer.computeDeltaRequest({
      program: { upsert: program },
    });
    if (result == null) {
      throw new Error('compute panic');
    }

    return resultFromComputerResult(result);
  } catch (error) {
    if (error instanceof TypeError || error instanceof RuntimeError) {
      return error.message;
    }
    const detail = `${codeExample}\n\n${
      (error as Error).stack || (error as Error).message
    }`;
    return {
      crash: `Error in getDocTestString for the following code:\n${detail}`,
    };
  }
}

const allCodeNodes = await runAllFiles();

it.each(
  Array.from(allCodeNodes.entries()).filter(([_, code]) => code.length > 0)
)('Running docs tests against snapshots', async (fileName, statements) => {
  const evaluated = await Promise.all(
    statements.map((s) => getDocTestString(s.code))
  );

  expect(evaluated, `error in ${fileName}`).toMatchObject(
    statements.map((s) => s.snapshot)
  );
});
