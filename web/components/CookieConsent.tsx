'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'bm_cookie_consent_v1';

type ConsentState = 'granted' | 'denied';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function updateGtagConsent(analytics: ConsentState, ads: ConsentState) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const gtag = window.gtag ?? function (...args: unknown[]) { window.dataLayer!.push(args); };
  gtag('consent', 'update', {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: analytics,
  });
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      setOpen(true);
      return;
    }
    if (saved === 'all') updateGtagConsent('granted', 'granted');
    else if (saved === 'analytics') updateGtagConsent('granted', 'denied');
    else updateGtagConsent('denied', 'denied');
  }, []);

  const save = (choice: 'all' | 'analytics' | 'necessary') => {
    localStorage.setItem(CONSENT_KEY, choice);
    if (choice === 'all') updateGtagConsent('granted', 'granted');
    else if (choice === 'analytics') updateGtagConsent('granted', 'denied');
    else updateGtagConsent('denied', 'denied');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Souhlas s používáním cookies"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[2000] border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-2xl dark:border-gray-700 dark:bg-gray-900/95"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center">
        <div className="flex-1 text-sm text-gray-700 dark:text-gray-200">
          <p className="mb-1 font-medium text-gray-900 dark:text-white">
            Tento web používá cookies
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Cookies používáme k analýze návštěvnosti (Google Analytics) a vylepšení webu.
            Marketingové cookies neumísťujeme bez vašeho souhlasu.{' '}
            <Link href="/zasady-cookies" className="underline hover:text-green-700 dark:hover:text-green-400">
              Více informací
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <button
            type="button"
            onClick={() => save('necessary')}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Jen nutné
          </button>
          <button
            type="button"
            onClick={() => save('analytics')}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Odmítnout marketing
          </button>
          <button
            type="button"
            onClick={() => save('all')}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  );
}
