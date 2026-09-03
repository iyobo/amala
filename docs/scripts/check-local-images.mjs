import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const docsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'docs'
);
const markdownImage = /!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g;
const safeProtocols = /^(?:data:|https?:|pathname:|#)/i;
const unsafeReferences = [];

async function markdownFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(entryPath);
    return /\.mdx?$/i.test(entry.name) ? [entryPath] : [];
  }));
  return nested.flat();
}

for (const filePath of await markdownFiles(docsDirectory)) {
  const source = await readFile(filePath, 'utf8');
  for (const match of source.matchAll(markdownImage)) {
    const imageReference = match[1].replace(/^<|>$/g, '');
    if (!safeProtocols.test(imageReference)) {
      unsafeReferences.push(
        `${path.relative(docsDirectory, filePath)}: ${imageReference}`
      );
    }
  }
}

if (unsafeReferences.length > 0) {
  console.error(
    'Local Markdown images must use the pathname:// protocol so Docusaurus does not parse untrusted image headers.\n' +
    unsafeReferences.map(reference => `- ${reference}`).join('\n')
  );
  process.exit(1);
}

console.log('Documentation image policy passed.');
