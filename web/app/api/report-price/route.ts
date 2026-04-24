import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DB_PATH = path.join('/tmp', 'user_prices.json');

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { submissions: {} };
  }
}

function writeDb(data: object) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data), 'utf-8');
}

export async function POST(req: NextRequest) {
  try {
    const { station_id, fuel_type, price, browser_id } = await req.json();

    if (!station_id || !fuel_type || !price || !browser_id) {
      return NextResponse.json({ error: 'Chybí povinné pole' }, { status: 400 });
    }
    const p = Number(price);
    if (isNaN(p) || p < 25 || p > 65) {
      return NextResponse.json({ error: 'Neplatná cena' }, { status: 400 });
    }
    const rounded = Math.round(p / 0.1) * 0.1;

    const db = readDb();
    if (!db.submissions[station_id]) db.submissions[station_id] = [];

    const stationSubs = db.submissions[station_id];
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    // Jeden příspěvek za 24h z jednoho browseru
    const alreadySubmitted = stationSubs.some(
      (s: any) => s.browser_id === browser_id && new Date(s.submitted_at).getTime() > cutoff
    );
    if (alreadySubmitted) {
      return NextResponse.json({ error: 'Cenu jsi pro tuto stanici již hlásil v posledních 24h' }, { status: 429 });
    }

    const entry = {
      id: randomUUID(),
      fuel_type,
      price: Math.round(rounded * 100) / 100,
      submitted_at: new Date().toISOString(),
      browser_id,
      confirmations: 0,
      confirmed_by: [] as string[],
    };

    stationSubs.push(entry);
    // Uchovej max posledních 20 na stanici
    if (stationSubs.length > 20) stationSubs.splice(0, stationSubs.length - 20);
    db.submissions[station_id] = stationSubs;

    writeDb(db);
    return NextResponse.json({ ok: true, id: entry.id });
  } catch (e) {
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}
