import { NextResponse } from 'next/server';
import { getCollectionName, getDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();

  if (!db) {
    return NextResponse.json({
      ok: true,
      mode: 'local-fallback',
      reason: 'Missing FIREBASE_* environment variables'
    });
  }

  const snap = await db.collection(getCollectionName()).limit(1).get();

  return NextResponse.json({
    ok: true,
    mode: 'firebase',
    sampleCount: snap.size
  });
}
