import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const WIKI_ROOT = path.join(process.cwd(), 'wiki');
const CAT_DIRS = ['entities', 'concepts', 'sources', 'syntheses'];
const CAT_TO_TYPE = {
  entities: 'entity',
  concepts: 'concept',
  sources: 'source',
  syntheses: 'synthesis'
};

function toTitle(fileName) {
  return fileName
    .replace(/\.md$/i, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function extractWikiLinks(content) {
  const matches = [...content.matchAll(/\[\[([^\]]+)\]\]/g)];
  return [...new Set(matches.map((m) => m[1].trim()).filter(Boolean))];
}

export async function readLocalWikiPages() {
  const all = [];

  for (const dir of CAT_DIRS) {
    const full = path.join(WIKI_ROOT, dir);
    let files = [];
    try {
      files = await fs.readdir(full);
    } catch {
      continue;
    }

    for (const file of files.filter((f) => f.endsWith('.md'))) {
      const absolute = path.join(full, file);
      const raw = await fs.readFile(absolute, 'utf8');
      const { data, content } = matter(raw);
      const id = file.replace(/\.md$/i, '');

      all.push({
        id,
        title: content.match(/^#\s+(.+)$/m)?.[1]?.trim() || toTitle(file),
        category: CAT_TO_TYPE[dir],
        links: extractWikiLinks(content),
        sourcePath: path.relative(process.cwd(), absolute),
        frontmatter: data,
        content,
        updatedAt: new Date().toISOString()
      });
    }
  }

  return all.sort((a, b) => a.id.localeCompare(b.id));
}
