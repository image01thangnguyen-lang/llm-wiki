import { getCollectionName, getDb } from '@/lib/firebase-admin';
import { readLocalWikiPages } from '@/lib/wiki-local';

export async function getWikiPages() {
  const db = getDb();

  if (!db) {
    return {
      source: 'local-fallback',
      pages: await readLocalWikiPages()
    };
  }

  const snapshot = await db.collection(getCollectionName()).get();
  const pages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (pages.length === 0) {
    return {
      source: 'firebase-empty-local-fallback',
      pages: await readLocalWikiPages()
    };
  }

  return {
    source: 'firebase',
    pages: pages.sort((a, b) => a.id.localeCompare(b.id))
  };
}
