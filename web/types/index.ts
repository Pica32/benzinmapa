export interface Station {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  region: string;
  services: string[];
  opening_hours: string;
}

export interface StationPrice {
  station_id: string;
  natural_95: number | null;
  natural_98: number | null;
  nafta: number | null;
  lpg: number | null;
  source: string;
  reported_at: string;
}

export interface StationWithPrice extends Station {
  price: StationPrice | null;
}

export interface Stats {
  last_updated: string;
  averages: {
    natural_95: number;
    natural_98: number;
    nafta: number;
    lpg: number;
  };
  cheapest_today: {
    natural_95: { price: number; station_id: string; city: string };
    nafta: { price: number; station_id: string; city: string };
    lpg: { price: number; station_id: string; city: string };
  };
  trend_7d: {
    natural_95: number;
    nafta: number;
    lpg: number;
  };
  total_stations: number;
  stations_updated_today: number;
}

export type FuelType = 'natural_95' | 'natural_98' | 'nafta' | 'lpg';

export const FUEL_LABELS: Record<FuelType, string> = {
  natural_95: 'Natural 95',
  natural_98: 'Natural 98',
  nafta: 'Nafta',
  lpg: 'LPG',
};

export const BRANDS = [
  'Benzina', 'MOL', 'Shell', 'OMV', 'Eurobit',
  'Robin Oil', 'Terno', 'EuroOil', 'Tank-ONO', 'Slovnaft',
];

export const CITIES = [
  // Největší města
  { name: 'Praha', slug: 'praha', lat: 50.0755, lng: 14.4378 },
  { name: 'Brno', slug: 'brno', lat: 49.1951, lng: 16.6068 },
  { name: 'Ostrava', slug: 'ostrava', lat: 49.8209, lng: 18.2625 },
  { name: 'Plzeň', slug: 'plzen', lat: 49.7506, lng: 13.3697 },
  { name: 'Liberec', slug: 'liberec', lat: 50.7671, lng: 15.0561 },
  { name: 'Olomouc', slug: 'olomouc', lat: 49.5938, lng: 17.2509 },
  { name: 'České Budějovice', slug: 'ceske-budejovice', lat: 48.9747, lng: 14.4744 },
  { name: 'Hradec Králové', slug: 'hradec-kralove', lat: 50.2104, lng: 15.8325 },
  { name: 'Ústí nad Labem', slug: 'usti-nad-labem', lat: 50.6607, lng: 14.0325 },
  { name: 'Pardubice', slug: 'pardubice', lat: 50.0343, lng: 15.7812 },
  { name: 'Zlín', slug: 'zlin', lat: 49.2243, lng: 17.6628 },
  { name: 'Karlovy Vary', slug: 'karlovy-vary', lat: 50.2324, lng: 12.8713 },
  { name: 'Havířov', slug: 'havirov', lat: 49.7792, lng: 18.4317 },
  { name: 'Kladno', slug: 'kladno', lat: 50.1436, lng: 14.1048 },
  { name: 'Most', slug: 'most', lat: 50.5025, lng: 13.6363 },
  { name: 'Opava', slug: 'opava', lat: 49.9384, lng: 17.9027 },
  { name: 'Frýdek-Místek', slug: 'frydek-mistek', lat: 49.6816, lng: 18.3503 },
  { name: 'Karviná', slug: 'karvina', lat: 49.8563, lng: 18.5432 },
  { name: 'Jihlava', slug: 'jihlava', lat: 49.3961, lng: 15.5875 },
  { name: 'Teplice', slug: 'teplice', lat: 50.6404, lng: 13.8249 },
  { name: 'Chomutov', slug: 'chomutov', lat: 50.4599, lng: 13.4150 },
  { name: 'Děčín', slug: 'decin', lat: 50.7738, lng: 14.2148 },
  { name: 'Mladá Boleslav', slug: 'mlada-boleslav', lat: 50.4150, lng: 14.9053 },
  { name: 'Prostějov', slug: 'prostejov', lat: 49.4726, lng: 17.1128 },
  { name: 'Přerov', slug: 'prerov', lat: 49.4564, lng: 17.4508 },
  { name: 'Třebíč', slug: 'trebic', lat: 49.2150, lng: 15.8791 },
  { name: 'Znojmo', slug: 'znojmo', lat: 48.8556, lng: 16.0486 },
  { name: 'Kroměříž', slug: 'kromeriz', lat: 49.2957, lng: 17.3936 },
  { name: 'Uherské Hradiště', slug: 'uherske-hradiste', lat: 49.0692, lng: 17.4603 },
  { name: 'Šumperk', slug: 'sumperk', lat: 49.9676, lng: 16.9718 },
  { name: 'Vsetín', slug: 'vsetin', lat: 49.3394, lng: 17.9952 },
  { name: 'Jičín', slug: 'jicin', lat: 50.4358, lng: 15.3612 },
  { name: 'Cheb', slug: 'cheb', lat: 50.0797, lng: 12.3720 },
  { name: 'Sokolov', slug: 'sokolov', lat: 50.1800, lng: 12.6416 },
  { name: 'Příbram', slug: 'pribram', lat: 49.6942, lng: 14.0078 },
  { name: 'Trutnov', slug: 'trutnov', lat: 50.5611, lng: 15.9128 },
  { name: 'Benešov', slug: 'benesov', lat: 49.7812, lng: 14.6860 },
  { name: 'Pelhřimov', slug: 'pelhrimov', lat: 49.4307, lng: 15.2232 },
  { name: 'Strakonice', slug: 'strakonice', lat: 49.2609, lng: 13.8997 },
  { name: 'Písek', slug: 'pisek', lat: 49.3092, lng: 14.1465 },
  { name: 'Klatovy', slug: 'klatovy', lat: 49.3955, lng: 13.2955 },
  { name: 'Chrudim', slug: 'chrudim', lat: 49.9514, lng: 15.7954 },
  { name: 'Havlíčkův Brod', slug: 'havlickuv-brod', lat: 49.6071, lng: 15.5796 },
  { name: 'Blansko', slug: 'blansko', lat: 49.3636, lng: 16.6472 },
  { name: 'Vyškov', slug: 'vyskov', lat: 49.2767, lng: 16.9993 },
  { name: 'Hodonín', slug: 'hodonin', lat: 48.8504, lng: 17.1316 },
  { name: 'Břeclav', slug: 'breclav', lat: 48.7590, lng: 16.8820 },
  { name: 'Nový Jičín', slug: 'novy-jicin', lat: 49.5942, lng: 18.0121 },
  { name: 'Kopřivnice', slug: 'koprivnice', lat: 49.5997, lng: 18.1447 },
  { name: 'Orlová', slug: 'orlova', lat: 49.8601, lng: 18.4296 },
  { name: 'Bruntál', slug: 'bruntal', lat: 49.9882, lng: 17.4643 },
  { name: 'Jeseník', slug: 'jesenik', lat: 50.2290, lng: 17.2005 },
  { name: 'Litoměřice', slug: 'litomerice', lat: 50.5363, lng: 14.1312 },
  { name: 'Louny', slug: 'louny', lat: 50.3556, lng: 13.7967 },
  { name: 'Česká Lípa', slug: 'ceska-lipa', lat: 50.6857, lng: 14.5383 },
  { name: 'Rychnov nad Kněžnou', slug: 'rychnov-nad-kneznou', lat: 50.1625, lng: 16.2750 },
  { name: 'Náchod', slug: 'nachod', lat: 50.4149, lng: 16.1657 },
  { name: 'Dvůr Králové nad Labem', slug: 'dvur-kralove-nad-labem', lat: 50.4333, lng: 15.8162 },
  { name: 'Jindřichův Hradec', slug: 'jindrichuv-hradec', lat: 49.1439, lng: 15.0011 },
  { name: 'Český Krumlov', slug: 'cesky-krumlov', lat: 48.8127, lng: 14.3175 },
  { name: 'Tábor', slug: 'tabor', lat: 49.4147, lng: 14.6561 },
  { name: 'Kolín', slug: 'kolin', lat: 50.0267, lng: 15.2050 },
  { name: 'Kutná Hora', slug: 'kutna-hora', lat: 49.9479, lng: 15.2682 },
  { name: 'Beroun', slug: 'beroun', lat: 49.9640, lng: 14.0705 },
  { name: 'Rakovník', slug: 'rakovnik', lat: 50.1065, lng: 13.7362 },
  { name: 'Mělník', slug: 'melnik', lat: 50.3505, lng: 14.4738 },
  { name: 'Nymburk', slug: 'nymburk', lat: 50.1865, lng: 15.0432 },
  { name: 'Poděbrady', slug: 'podebrady', lat: 50.1432, lng: 15.1196 },
  { name: 'Turnov', slug: 'turnov', lat: 50.5849, lng: 15.1579 },
  { name: 'Jablonec nad Nisou', slug: 'jablonec-nad-nisou', lat: 50.7238, lng: 15.1703 },
  { name: 'Česká Třebová', slug: 'ceska-trebova', lat: 49.9017, lng: 16.4431 },
  { name: 'Svitavy', slug: 'svitavy', lat: 49.7560, lng: 16.4688 },
  { name: 'Ústí nad Orlicí', slug: 'usti-nad-orlici', lat: 49.9714, lng: 16.3985 },
  { name: 'Lanškroun', slug: 'lanskroun', lat: 49.9126, lng: 16.6144 },
  { name: 'Vysoké Mýto', slug: 'vysoke-myto', lat: 49.9541, lng: 16.1613 },
  { name: 'Litomyšl', slug: 'litomysl', lat: 49.8704, lng: 16.3120 },
  { name: 'Žďár nad Sázavou', slug: 'zdar-nad-sazavou', lat: 49.5635, lng: 15.9393 },
  { name: 'Velké Meziříčí', slug: 'velke-mezirici', lat: 49.3556, lng: 16.0150 },
  { name: 'Moravské Budějovice', slug: 'moravske-budejovice', lat: 49.0521, lng: 15.8126 },
  { name: 'Šternberk', slug: 'sternberk', lat: 49.7296, lng: 17.2994 },
  { name: 'Uherský Brod', slug: 'uhersky-brod', lat: 49.0259, lng: 17.6473 },
  { name: 'Valašské Meziříčí', slug: 'valasske-mezirici', lat: 49.4717, lng: 17.9710 },
  { name: 'Rožnov pod Radhoštěm', slug: 'roznov-pod-radhostem', lat: 49.4573, lng: 18.1428 },
  { name: 'Kyjov', slug: 'kyjov', lat: 49.0110, lng: 17.1243 },
  { name: 'Veselí nad Moravou', slug: 'veseli-nad-moravou', lat: 48.9530, lng: 17.3678 },
  { name: 'Hlučín', slug: 'hlucin', lat: 49.8985, lng: 18.1933 },
  { name: 'Bohumín', slug: 'bohumin', lat: 49.9020, lng: 18.3581 },
  { name: 'Třinec', slug: 'trinec', lat: 49.6778, lng: 18.6710 },
  { name: 'Český Těšín', slug: 'cesky-tesin', lat: 49.7468, lng: 18.6246 },
  { name: 'Studénka', slug: 'studenka', lat: 49.7238, lng: 18.0792 },
  { name: 'Bílovec', slug: 'bilovec', lat: 49.7582, lng: 17.8897 },
  { name: 'Šlapanice', slug: 'slapanice', lat: 49.1747, lng: 16.7275 },
  { name: 'Kuřim', slug: 'kurim', lat: 49.2983, lng: 16.5317 },
  { name: 'Hustopeče', slug: 'hustopece', lat: 48.9406, lng: 16.7373 },
  { name: 'Mikulov', slug: 'mikulov', lat: 48.8059, lng: 16.6374 },
  { name: 'Pohořelice', slug: 'pohorelice', lat: 48.9844, lng: 16.5254 },
  { name: 'Domažlice', slug: 'domazlice', lat: 49.4420, lng: 12.9295 },
  { name: 'Rokycany', slug: 'rokycany', lat: 49.7422, lng: 13.5933 },
  { name: 'Stříbro', slug: 'stribro', lat: 49.7533, lng: 13.0046 },
  { name: 'Sušice', slug: 'susice', lat: 49.2313, lng: 13.5161 },
  { name: 'Vlašim', slug: 'vlasim', lat: 49.7063, lng: 14.8990 },
  { name: 'Sedlčany', slug: 'sedlcany', lat: 49.6602, lng: 14.4265 },
  { name: 'Humpolec', slug: 'humpolec', lat: 49.5411, lng: 15.3594 },
  { name: 'Pacov', slug: 'pacov', lat: 49.4674, lng: 15.0049 },
  { name: 'Veselí nad Lužnicí', slug: 'veseli-nad-luznici', lat: 49.1867, lng: 14.6990 },
  { name: 'Týn nad Vltavou', slug: 'tyn-nad-vltavou', lat: 49.2207, lng: 14.4198 },
  { name: 'Milevsko', slug: 'milevsko', lat: 49.4554, lng: 14.3596 },
  { name: 'Hořovice', slug: 'horovice', lat: 49.8377, lng: 13.9070 },
  { name: 'Kralupy nad Vltavou', slug: 'kralupy-nad-vltavou', lat: 50.2409, lng: 14.3148 },
  { name: 'Neratovice', slug: 'neratovice', lat: 50.2592, lng: 14.5186 },
  { name: 'Brandýs nad Labem', slug: 'brandys-nad-labem', lat: 50.1883, lng: 14.6631 },
  { name: 'Čelákovice', slug: 'celakovice', lat: 50.1600, lng: 14.7449 },
  { name: 'Říčany', slug: 'ricany', lat: 49.9909, lng: 14.6549 },
  { name: 'Černošice', slug: 'cernosice', lat: 49.9476, lng: 14.3230 },
  { name: 'Roztoky', slug: 'roztoky', lat: 50.1604, lng: 14.3937 },
  { name: 'Unhošť', slug: 'unhost', lat: 50.0946, lng: 14.0530 },
  { name: 'Slaný', slug: 'slany', lat: 50.2312, lng: 14.0864 },
  { name: 'Hořice', slug: 'horice', lat: 50.3656, lng: 15.6326 },
  { name: 'Police nad Metují', slug: 'police-nad-metuji', lat: 50.5364, lng: 16.2310 },
  { name: 'Broumov', slug: 'broumov', lat: 50.5851, lng: 16.3316 },
  { name: 'Nová Paka', slug: 'nova-paka', lat: 50.4905, lng: 15.5144 },
  { name: 'Semily', slug: 'semily', lat: 50.6027, lng: 15.3379 },
  { name: 'Frýdlant', slug: 'frydlant', lat: 50.9213, lng: 15.0816 },
  { name: 'Nové Město na Moravě', slug: 'nove-mesto-na-morave', lat: 49.5606, lng: 16.0744 },
  { name: 'Bystřice nad Pernštejnem', slug: 'bystrice-nad-pernstejnem', lat: 49.5298, lng: 16.2623 },
  { name: 'Boskovice', slug: 'boskovice', lat: 49.4890, lng: 16.6630 },
  { name: 'Tišnov', slug: 'tisnov', lat: 49.3484, lng: 16.4245 },
  { name: 'Ivančice', slug: 'ivancice', lat: 49.1011, lng: 16.3763 },
  { name: 'Lipník nad Bečvou', slug: 'lipnik-nad-becvou', lat: 49.5247, lng: 17.5836 },
  { name: 'Hranice', slug: 'hranice', lat: 49.5497, lng: 17.7394 },
  { name: 'Kojetín', slug: 'kojetin', lat: 49.3547, lng: 17.3049 },
  { name: 'Holešov', slug: 'holesov', lat: 49.3348, lng: 17.5791 },
  { name: 'Napajedla', slug: 'napajedla', lat: 49.1699, lng: 17.5143 },
  { name: 'Praha 5', slug: 'praha-5', lat: 50.0620, lng: 14.3940 },
  { name: 'Praha 6', slug: 'praha-6', lat: 50.1014, lng: 14.3731 },
  { name: 'Praha 10', slug: 'praha-10', lat: 50.0691, lng: 14.4815 },
  { name: 'Praha 4', slug: 'praha-4', lat: 50.0349, lng: 14.4556 },
  { name: 'Praha 9', slug: 'praha-9', lat: 50.1108, lng: 14.5124 },
];

export const REGIONS = [
  { name: 'Jihomoravský kraj', slug: 'jihomoravsky' },
  { name: 'Jihočeský kraj', slug: 'jihocesky' },
  { name: 'Karlovarský kraj', slug: 'karlovarsky' },
  { name: 'Královéhradecký kraj', slug: 'kralovehradecky' },
  { name: 'Liberecký kraj', slug: 'liberecky' },
  { name: 'Moravskoslezský kraj', slug: 'moravskoslezsky' },
  { name: 'Olomoucký kraj', slug: 'olomoucky' },
  { name: 'Pardubický kraj', slug: 'pardubicky' },
  { name: 'Plzeňský kraj', slug: 'plzensky' },
  { name: 'Středočeský kraj', slug: 'stredocesky' },
  { name: 'Ústecký kraj', slug: 'ustecky' },
  { name: 'Vysočina', slug: 'vysocina' },
  { name: 'Zlínský kraj', slug: 'zlinsky' },
  { name: 'Hlavní město Praha', slug: 'hlavni-mesto-praha' },
];
