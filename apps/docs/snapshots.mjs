import fs from 'fs';
import glob from 'glob';
import { join as pathJoin } from 'path';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import { spawnSync } from 'child_process';
import { diffLines } from 'diff';
import prettier from 'prettier';
import chalk from 'chalk';

const docsDir = new URL('.', import.meta.url).pathname;

const snapshotSeparator = '\n==> ';
const isUpdating =
  process.argv.includes('--update') || process.argv.includes('--update=true');

let failures = 0;

// HACK: This function is equivalent to `return await runCode(source)`
// But I can't import the language and I've already spent hours trying.
const runCode = (sources) => {
  if (sources.length === 0) {
    return [];
  }

  // NOTE: this is very slow even when batching all examples in each .md file
  // But we can load all markdown ASTs into memory and run this subprocess only once.
  const { stdout, stderr, error } = spawnSync(
    pathJoin(docsDir, '../../node_modules/.bin/babel-node'),
    [
      '--extensions=.js,.jsx,.ts,.tsx',
      pathJoin(docsDir, '../../libs/language/src/evaluate-docs-examples.ts'),
    ],
    { input: JSON.stringify(sources) }
  );

  if (stderr && stderr.length) {
    // eslint-disable-next-line no-console
    console.error(`STDERR: ${stderr.toString('utf-8')}`);
  }

  if (error) {
    throw error;
  } else {
    const out = stdout.toString('utf-8');
    try {
      return JSON.parse(out);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error parsing output ${out}`);
      throw err;
    }
  }
};

const snapshotTestingPlugin =
  (fileName) =>
  () =>
  async ({ children: topLevelNodes }) => {
    const nodes = topLevelNodes
      .filter(
        ({ type, lang, meta }) =>
          type === 'code' && lang === 'deci' && meta === 'live'
      )
      .map((node) => {
        const [code, snapshot = '(no snapshot)'] =
          node.value.split(snapshotSeparator);

        return { node, code, snapshot };
      });

    const results = await runCode(nodes.map((n) => n.code));

    for (let i = 0; i < nodes.length; i += 1) {
      const { node, code, snapshot } = nodes[i];
      const actualValue = results[i];

      if (snapshot !== actualValue) {
        failures += 1;
        // eslint-disable-next-line no-console
        console.error(`--\ndifferent result in ${fileName}`);

        diffLines(snapshot, actualValue).forEach((part) => {
          const colorizeLine = part.added
            ? (s) => chalk.green(`+ ${s}`)
            : part.removed
            ? (s) => chalk.red(`- ${s}`)
            : (s) => `  ${s}`;

          const lines = part.value.split('\n').map(colorizeLine).join('\n');

          console.error(lines);
        });
      }

      node.value = code + snapshotSeparator + actualValue;
    }
  };

async function testOneFile(fileName, relativeFileName) {
  const theTests = fs.readFileSync(fileName, { encoding: 'utf-8' });

  const file = await remark()
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(snapshotTestingPlugin(relativeFileName))
    .process(theTests);

  if (isUpdating) {
    const prettierConfig = await prettier.resolveConfig(fileName);

    const newContents = await prettier.format(file.toString(), {
      ...prettierConfig,
      filepath: fileName,
    });
    fs.writeFileSync(fileName, newContents);
  }
}

async function runDocTests() {
  for (const file of glob.sync('docs/**/*.md', { cwd: docsDir })) {
    // eslint-disable-next-line no-await-in-loop
    await testOneFile(pathJoin(docsDir, file), file);
  }

  if (failures > 0 && !isUpdating) {
    // eslint-disable-next-line no-console
    console.error(
      'There are failed doctests. Add --update to this command to update the snapshots.'
    );
    process.exit(1);
  }
}

runDocTests().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
