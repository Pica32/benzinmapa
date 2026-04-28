'use client';

import { useEffect, useState, useCallback } from 'react';
import { FUEL_LABELS, FuelType } from '@/types';
import { Users, CheckCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface UserSub {
  id: string;
  fuel_type: FuelType;
  price: number;
  submitted_at: string;
  confirmations: number;
}

function getBrowserId(): string {
  if (typeof localStorage === 'undefined') return 'ssr';
  let id = localStorage.getItem('benzinmapa_bid');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('benzinmapa_bid', id);
  }
  return id;
}

function getConfirmed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('benzinmapa_confirmed') ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveConfirmed(set: Set<string>) {
  localStorage.setItem('benzinmapa_confirmed', JSON.stringify([...set]));
}

const FUEL_ORDER: FuelType[] = ['natural_95', 'nafta', 'natural_98', 'lpg'];

interface PriceReportProps {
  stationId: string;
  initialFuel?: FuelType;
  forceOpen?: boolean;
}

export default function PriceReport({ stationId, initialFuel, forceOpen }: PriceReportProps) {
  const [subs, setSubs] = useState<UserSub[]>([]);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [formFuel, setFormFuel] = useState<FuelType>(initialFuel ?? 'natural_95');
  const [formPrice, setFormPrice] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/user-prices/${stationId}`);
    if (res.ok) setSubs(await res.json());
    setConfirmed(getConfirmed());
  }, [stationId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if (initialFuel) setFormFuel(initialFuel);
  }, [initialFuel]);

  // Odsouhlasené ceny s 3+ potvrzeními — pro zobrazení vedle oficálních cen
  const verified = subs.filter(s => s.confirmations >= 3);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    const p = parseFloat(formPrice.replace(',', '.'));
    if (isNaN(p) || p < 25 || p > 65) {
      setMsg({ text: 'Cena musí být mezi 25 a 65 Kč', ok: false });
      setSending(false);
      return;
    }
    const res = await fetch('/api/report-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station_id: stationId, fuel_type: formFuel, price: p, browser_id: getBrowserId() }),
    });
    const data = await res.json();
    setMsg({ text: res.ok ? 'Cena nahlášena, díky!' : (data.error ?? 'Chyba'), ok: res.ok });
    if (res.ok) { setFormPrice(''); load(); }
    setSending(false);
  }

  async function confirm(subId: string) {
    const res = await fetch('/api/confirm-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: subId, station_id: stationId, browser_id: getBrowserId() }),
    });
    if (res.ok) {
      const newSet = new Set(confirmed).add(subId);
      setConfirmed(newSet);
      saveConfirmed(newSet);
      load();
    } else {
      const d = await res.json();
      setMsg({ text: d.error ?? 'Chyba', ok: false });
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

      {/* Ověřené ceny uživatelů (3+ potvrzení) — vždy viditelné */}
      {verified.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Users size={13} /> Ceny uživatelů (ověřeno)
          </p>
          <div className="flex flex-wrap gap-3">
            {verified.map(s => (
              <div key={s.id} className="bg-white dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-2 text-center">
                <div className="text-[10px] text-blue-500 uppercase tracking-wide">{FUEL_LABELS[s.fuel_type]}</div>
                <div className="text-xl font-black text-blue-700 dark:text-blue-300 leading-tight">
                  {s.price.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-[9px] text-blue-400">Kč/l · {s.confirmations}× ověřeno</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Users size={15} className="text-blue-500" />
          Nahlásit / potvrdit cenu
          {subs.length > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {subs.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">

          {/* Formulář */}
          <form onSubmit={submit} className="mb-5">
            <p className="text-xs text-gray-500 mb-3">Víš aktuální cenu? Nahlásíš ji za pár sekund.</p>

            {/* Typ paliva */}
            <div className="flex gap-2 flex-wrap mb-3">
              {FUEL_ORDER.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormFuel(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    formFuel === f
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {FUEL_LABELS[f]}
                </button>
              ))}
            </div>

            {/* Cena — hlavní prvek formuláře */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Cena Kč/l</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="např. 39,90"
                  value={formPrice}
                  onChange={e => setFormPrice(e.target.value)}
                  required
                  className="w-full text-3xl font-black text-center border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm"
              >
                <Send size={15} />
                {sending ? 'Odesílám…' : 'Nahlásit'}
              </button>
            </div>
          </form>

          {msg && (
            <p className={`text-sm mb-4 px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </p>
          )}

          {/* Seznam nahlášených cen */}
          {subs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nahlášené ceny (posledních 24h)</p>
              {subs
                .sort((a, b) => b.confirmations - a.confirmations)
                .map(s => {
                  const isConfirmed = confirmed.has(s.id);
                  const verified3 = s.confirmations >= 3;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between rounded-xl p-3 border ${
                        verified3
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div>
                        <span className="text-xs text-gray-400 mr-2">{FUEL_LABELS[s.fuel_type]}</span>
                        <span className={`text-xl font-black ${verified3 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100'}`}>
                          {s.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">Kč/l</span>
                        {verified3 && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                            ✓ Ověřeno
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{s.confirmations}/3</span>
                        {!isConfirmed ? (
                          <button
                            onClick={() => confirm(s.id)}
                            className="text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:border-green-400 hover:text-green-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                          >
                            Potvrdit
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <CheckCircle size={13} /> Potvrzeno
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {subs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">Zatím žádné hlášení. Buď první!</p>
          )}
        </div>
      )}
    </div>
  );
}
