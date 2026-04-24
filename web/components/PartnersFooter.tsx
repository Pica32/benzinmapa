'use client';

const PARTNERS = [
  { name: 'Pergol.cz', url: 'https://pergol.cz', desc: 'Zahradní pergoly' },
  { name: 'Stromtek.cz', url: 'https://stromtek.cz', desc: 'Stromy a zahrada' },
  { name: 'BitcoinChurch.cz', url: 'https://bitcoinchurch.cz', desc: 'Bitcoin komunita' },
  { name: 'Combie.cz', url: 'https://combie.cz', desc: 'Mobilní aplikace' },
  { name: 'Free-Bitcoin.lat', url: 'https://free-bitcoin.lat', desc: 'Kryptoměny' },
  { name: 'PeptiLab.cz', url: 'https://peptilab.cz', desc: 'Peptidy a výzkum' },
  { name: 'BitcoinChurch.eu', url: 'https://bitcoinchurch.eu', desc: 'Bitcoin Evropa' },
  { name: 'BitcoinChurchAsia', url: 'https://bitcoinchurchasia.com', desc: 'Bitcoin Asie' },
  { name: 'BitcoinAfrica', url: 'https://bitcoinafrica.site', desc: 'Bitcoin Afrika' },
  { name: 'Nadace.online', url: 'https://nadace.online', desc: 'Neziskové organizace' },
];

export default function PartnersFooter() {
  return (
    <section className="bg-gray-900 border-t border-gray-700 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4 text-center">
          Naši partneři
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {PARTNERS.map((p) => (
            <a
              key={p.url}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              title={p.desc}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-full border border-gray-700 hover:border-gray-500 transition-all duration-200"
            >
              {p.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
