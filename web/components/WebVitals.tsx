'use client';
import { useEffect } from 'react';
import { onCLS, onLCP, onFCP, onTTFB, onINP } from 'web-vitals';

function sendToConsole({ name, value, rating }: { name: string; value: number; rating: string }) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}: ${Math.round(value)} (${rating})`);
  }
  // Sem lze přidat odesílání na analytics endpoint, např.:
  // fetch('/api/vitals', { method: 'POST', body: JSON.stringify({ name, value, rating }) });
}

export default function WebVitals() {
  useEffect(() => {
    onCLS(sendToConsole);
    onLCP(sendToConsole);
    onFCP(sendToConsole);
    onTTFB(sendToConsole);
    onINP(sendToConsole);
  }, []);
  return null;
}
