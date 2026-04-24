'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  lat: string;
  lng: string;
  name: string;
}

export default function GpsButtons({ lat, lng, name }: Props) {
  const [copied, setCopied] = useState(false);

  const copyGps = async () => {
    const text = `${lat}, ${lng}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareStation = async () => {
    if (navigator.share) {
      await navigator.share({
        title: name,
        text: `GPS: ${lat}, ${lng}`,
        url: window.location.href,
      });
    } else {
      // Fallback: zkopíruj odkaz
      await navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={copyGps}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-700 dark:hover:text-green-400 transition-all"
      >
        {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
        {copied ? 'Zkopírováno!' : 'Kopírovat GPS'}
      </button>

      <button
        onClick={shareStation}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-all"
      >
        📤 Sdílet stanici
      </button>
    </div>
  );
}
