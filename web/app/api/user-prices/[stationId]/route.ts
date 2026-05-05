import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TMP_PATH    = path.join('/tmp', 'user_prices.json');
const STATIC_PATH = path.join(process.cwd(), 'public', 'data', 'user_prices.json');

function readDb(filePath: string) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return { submissions: {} };
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ stationId: string }> }) {
  try {
    const { stationId } = await params;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    // Merge: runtime /tmp/ data + static baseline z public/data/
    const tmpDb    = readDb(TMP_PATH);
    const staticDb = readDb(STATIC_PATH);

    const tmpRaw:    any[] = tmpDb.submissions[stationId]    ?? [];
    const staticRaw: any[] = staticDb.submissions[stationId] ?? [];

    // Deduplikace podle id, tmp data mají přednost
    const seen = new Set<string>();
    const merged = [...tmpRaw, ...staticRaw].filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return new Date(s.submitted_at).getTime() > cutoff;
    });

    const result = merged.map(({ id, fuel_type, price, submitted_at, confirmations }) => ({
      id, fuel_type, price, submitted_at, confirmations,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
