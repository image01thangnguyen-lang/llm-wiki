import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const collectionName = process.env.FIRESTORE_COLLECTION || 'wiki_pages';
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const CAT_TO_TYPE = {
  entities: 'entity',
  concepts: 'concept',
  sources: 'source',
  syntheses: 'synthesis'
};

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();
const wikiRoot = path.join(process.cwd(), 'wiki');
const cats = ['entities', 'concepts', 'sources', 'syntheses'];

function extractLinks(content) {
  return [...new Set([...content.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1].trim()).filter(Boolean))];
}

function titleFromContent(content, file) {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.replace(/\.md$/, '');
}

const pages = [];
for (const cat of cats) {
  const dir = path.join(wikiRoot, cat);
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    continue;
  }

  for (const file of files.filter((f) => f.endsWith('.md'))) {
    const p = path.join(dir, file);
    const raw = await fs.readFile(p, 'utf8');
    const { data, content } = matter(raw);
    const id = file.replace(/\.md$/, '');

    pages.push({
      id,
      title: titleFromContent(content, file),
      category: CAT_TO_TYPE[cat],
      links: extractLinks(content),
      sourcePath: path.relative(process.cwd(), p),
      frontmatter: data,
      content,
      updatedAt: new Date().toISOString()
    });
  }
}

let written = 0;
for (const page of pages) {
  await db.collection(collectionName).doc(page.id).set(page, { merge: true });
  written += 1;
}

console.log(`Synced ${written} wiki pages to Firestore collection: ${collectionName}`);
