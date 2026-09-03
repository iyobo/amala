import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repositoryDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);
const currentDocsDirectory = path.join(repositoryDirectory, 'docs', 'docs');
const websiteSourceDirectory = path.join(repositoryDirectory, 'docs', 'src');
const markdownFiles = [path.join(repositoryDirectory, 'README.md')];

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdownFiles(entryPath);
    return /\.mdx?$/i.test(entry.name) ? [entryPath] : [];
  }));
  return nested.flat();
}

markdownFiles.push(...await collectMarkdownFiles(currentDocsDirectory));

const incompleteExamples = [];
const typescriptFence = /^```(?:typescript|ts)\s*$([\s\S]*?)^```\s*$/gm;
const bootstrapCall = /bootstrapControllers(?:<[^;\n]*>)?\s*\(/;

for (const filePath of markdownFiles) {
  const source = await readFile(filePath, 'utf8');
  for (const match of source.matchAll(typescriptFence)) {
    if (bootstrapCall.test(match[1])) continue;

    const beforeExample = source.slice(0, match.index);
    const tabsStart = beforeExample.lastIndexOf('<Tabs');
    const priorTabsEnd = beforeExample.lastIndexOf('</Tabs>');
    const tabsEnd = source.indexOf('</Tabs>', match.index);
    if (
      tabsStart > priorTabsEnd &&
      tabsEnd !== -1 &&
      bootstrapCall.test(source.slice(tabsStart, tabsEnd))
    ) {
      continue;
    }

    const line = source.slice(0, match.index).split('\n').length;
    incompleteExamples.push(
      `${path.relative(repositoryDirectory, filePath)}:${line}`
    );
  }
}

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScriptFiles(entryPath);
    return /\.jsx?$/i.test(entry.name) ? [entryPath] : [];
  }));
  return nested.flat();
}

for (const filePath of await collectJavaScriptFiles(websiteSourceDirectory)) {
  const source = await readFile(filePath, 'utf8');
  const templates = new Map(
    [...source.matchAll(/const\s+(\w+)\s*=\s*`([\s\S]*?)`;/g)]
      .map(match => [match[1], match[2]])
  );
  const codeBlock = /<CodeBlock\b[^>]*language=["']typescript["'][^>]*>\s*\{([\w.]+)\}\s*<\/CodeBlock>/g;

  for (const match of source.matchAll(codeBlock)) {
    const example = templates.get(match[1]);
    if (example && bootstrapCall.test(example)) continue;
    if (match[1].includes('.')) continue;

    const line = source.slice(0, match.index).split('\n').length;
    incompleteExamples.push(
      `${path.relative(repositoryDirectory, filePath)}:${line}`
    );
  }

  for (const match of source.matchAll(/\bcode:\s*`([\s\S]*?)`/g)) {
    if (bootstrapCall.test(match[1])) continue;

    const line = source.slice(0, match.index).split('\n').length;
    incompleteExamples.push(
      `${path.relative(repositoryDirectory, filePath)}:${line}`
    );
  }
}

if (incompleteExamples.length > 0) {
  console.error(
    'Every current TypeScript example group must include a bootstrapControllers() call.\n' +
    incompleteExamples.map(example => `- ${example}`).join('\n')
  );
  process.exit(1);
}

console.log('Documentation example-group policy passed.');
