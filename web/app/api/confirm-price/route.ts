import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'public', 'data', 'user_prices.json');

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
    const { submission_id, station_id, browser_id } = await req.json();

    if (!submission_id || !station_id || !browser_id) {
      return NextResponse.json({ error: 'Chybí povinné pole' }, { status: 400 });
    }

    const db = readDb();
    const stationSubs = db.submissions[station_id] ?? [];
    const sub = stationSubs.find((s: any) => s.id === submission_id);

    if (!sub) return NextResponse.json({ error: 'Příspěvek nenalezen' }, { status: 404 });
    if (sub.browser_id === browser_id) {
      return NextResponse.json({ error: 'Nemůžeš potvrdit vlastní cenu' }, { status: 403 });
    }
    if (sub.confirmed_by.includes(browser_id)) {
      return NextResponse.json({ error: 'Již jsi potvrdil tuto cenu' }, { status: 409 });
    }

    sub.confirmed_by.push(browser_id);
    sub.confirmations = sub.confirmed_by.length;

    writeDb(db);
    return NextResponse.json({ ok: true, confirmations: sub.confirmations });
  } catch {
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}
