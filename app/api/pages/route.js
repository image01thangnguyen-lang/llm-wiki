import { NextResponse } from 'next/server';
import { getWikiPages } from '@/lib/wiki-service';

export const runtime = 'nodejs';

export async function GET() {
  const result = await getWikiPages();
  return NextResponse.json(result);
}
