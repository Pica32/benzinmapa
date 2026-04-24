import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'public', 'data', 'user_prices.json');

export async function GET(_req: NextRequest, { params }: { params: Promise<{ stationId: string }> }) {
  try {
    const { stationId } = await params;
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const raw: any[] = db.submissions[stationId] ?? [];

    // Vrátíme jen posledních 24h, bez browser_id pro soukromí
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const result = raw
      .filter(s => new Date(s.submitted_at).getTime() > cutoff)
      .map(({ id, fuel_type, price, submitted_at, confirmations }) => ({
        id, fuel_type, price, submitted_at, confirmations,
      }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
