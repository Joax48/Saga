import type { CollaborationPoint } from '@/components/CollaborationMapPreview';

export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Costa Rica': { lat: 9.7489, lng: -83.7534 },
  'United States': { lat: 37.0902, lng: -95.7129 },
  'Estados Unidos': { lat: 37.0902, lng: -95.7129 },
  Mexico: { lat: 23.6345, lng: -102.5528 },
  México: { lat: 23.6345, lng: -102.5528 },
  Spain: { lat: 40.4637, lng: -3.7492 },
  España: { lat: 40.4637, lng: -3.7492 },
  Germany: { lat: 51.1657, lng: 10.4515 },
  Alemania: { lat: 51.1657, lng: 10.4515 },
  France: { lat: 46.2276, lng: 2.2137 },
  Francia: { lat: 46.2276, lng: 2.2137 },
  'United Kingdom': { lat: 55.3781, lng: -3.436 },
  'Reino Unido': { lat: 55.3781, lng: -3.436 },
  Brazil: { lat: -14.235, lng: -51.9253 },
  Brasil: { lat: -14.235, lng: -51.9253 },
  Colombia: { lat: 4.5709, lng: -74.2973 },
  Chile: { lat: -35.6751, lng: -71.543 },
  Argentina: { lat: -38.4161, lng: -63.6167 },
  Canada: { lat: 56.1304, lng: -106.3468 },
  Canadá: { lat: 56.1304, lng: -106.3468 },
  Japan: { lat: 36.2048, lng: 138.2529 },
  Japón: { lat: 36.2048, lng: 138.2529 },
  China: { lat: 35.8617, lng: 104.1954 },
  Italy: { lat: 41.8719, lng: 12.5674 },
  Italia: { lat: 41.8719, lng: 12.5674 },
  Netherlands: { lat: 52.1326, lng: 5.2913 },
  'Países Bajos': { lat: 52.1326, lng: 5.2913 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  Sweden: { lat: 60.1282, lng: 18.6435 },
  Suecia: { lat: 60.1282, lng: 18.6435 },
  Switzerland: { lat: 46.8182, lng: 8.2275 },
  Suiza: { lat: 46.8182, lng: 8.2275 },
  Panama: { lat: 8.538, lng: -80.7821 },
  Panamá: { lat: 8.538, lng: -80.7821 },
  Peru: { lat: -9.19, lng: -75.0152 },
  Perú: { lat: -9.19, lng: -75.0152 },
  Venezuela: { lat: 6.4238, lng: -66.5897 },
  Ecuador: { lat: -1.8312, lng: -78.1834 },
  Cuba: { lat: 21.5218, lng: -77.7812 },
  Uruguay: { lat: -32.5228, lng: -55.7658 },
  Portugal: { lat: 39.3999, lng: -8.2245 },
  'South Korea': { lat: 35.9078, lng: 127.7669 },
  'Corea del Sur': { lat: 35.9078, lng: 127.7669 },
  India: { lat: 20.5937, lng: 78.9629 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  Sudáfrica: { lat: -30.5595, lng: 22.9375 },
  Russia: { lat: 61.524, lng: 105.3188 },
  Rusia: { lat: 61.524, lng: 105.3188 },
};

export const CR_NODE: CollaborationPoint = {
  id: 'cr',
  lat: 9.7489,
  lng: -83.7534,
  country: 'Costa Rica',
  count: 0,
  tone: 'accent',
  isMain: true,
};

export function countriesToCollaborationPoints(
  countries: { country: string; count: number }[],
  totalAuthors?: number,
): CollaborationPoint[] {
  const crCount = countries.find(({ country }) => country === 'Costa Rica')?.count ?? 0;

  const crNode: CollaborationPoint = {
    ...CR_NODE,
    count: crCount || (totalAuthors ?? 0),
  };

  const sorted = countries
    .filter(({ country }) => country !== 'Costa Rica')
    .sort((a, b) => b.count - a.count);

  const points: CollaborationPoint[] = [crNode];

  sorted.forEach(({ country, count }, index) => {
    const coords = COUNTRY_COORDINATES[country];
    if (!coords) return;
    points.push({
      id: country.toLowerCase().replace(/\s+/g, '-'),
      lat: coords.lat,
      lng: coords.lng,
      country,
      count,
      tone: index < 3 ? 'primary' : 'secondary',
    });
  });

  return points;
}
