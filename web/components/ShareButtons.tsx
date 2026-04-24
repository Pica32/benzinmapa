'use client';

import { useState } from 'react';

interface Props {
  url: string;
  title: string;
  compact?: boolean;
}

export default function ShareButtons({ url, title, compact = false }: Props) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const fb      = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const twitter = `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`;
  const wa      = `https://wa.me/?text=${enc(title + ' ' + url)}`;
  const tg      = `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); }
    catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btns = [
    { href: fb,      bg: 'bg-[#1877f2]', label: compact ? 'f' : 'Facebook',  title: 'Sdílet na Facebook' },
    { href: twitter, bg: 'bg-[#1da1f2]', label: compact ? 'X' : 'X/Twitter', title: 'Sdílet na X (Twitter)' },
    { href: wa,      bg: 'bg-[#25d366]', label: compact ? 'W' : 'WhatsApp',   title: 'Sdílet přes WhatsApp' },
    { href: tg,      bg: 'bg-[#229ed9]', label: compact ? 'TG' : 'Telegram',  title: 'Sdílet na Telegram' },
  ];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${compact ? '' : 'my-4'}`}>
      {!compact && <span className="text-sm text-gray-500 font-medium">Sdílet:</span>}
      {btns.map(b => (
        <a key={b.href} href={b.href} target="_blank" rel="noopener noreferrer"
           title={b.title}
           className={`${b.bg} text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity`}>
          {b.label}
        </a>
      ))}
      <button onClick={copyLink}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
        {copied ? '✓ Zkopírováno' : '🔗 Kopírovat'}
      </button>
    </div>
  );
}
