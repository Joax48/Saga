'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { BookOpen, FolderOpen, X } from 'lucide-react';
import { lookupCountryCoordinates } from '@/data/country-coordinates';

export type CollaborationInstitution = {
  name: string;
  researchCount: number;
  projectCount: number;
};

export type CollaborationPoint = {
  id: string;
  lat: number;
  lng: number;
  country: string;
  count: number;
  tone?: 'primary' | 'secondary' | 'accent';
  isMain?: boolean;
  institutions?: CollaborationInstitution[];
};

const COSTA_RICA_NODE: CollaborationPoint = {
  id: 'cr',
  lat: 9.7489,
  lng: -83.7534,
  country: 'Costa Rica',
  count: 0,
  tone: 'accent',
  isMain: true,
};

export function buildCollaborationPoints(
  countries: { country: string; count: number }[],
): CollaborationPoint[] {
  const maxCount = countries.reduce((max, c) => Math.max(max, c.count), 0);
  const crEntry = countries.find((c) => normalize(c.country) === 'costa rica');

  const points: CollaborationPoint[] = [];
  for (const { country, count } of countries) {
    if (normalize(country) === 'costa rica') continue;
    const coords = lookupCountryCoordinates(country);
    if (!coords) continue;
    const tone: CollaborationPoint['tone'] =
      maxCount > 0 && count >= maxCount * (2 / 3) ? 'primary' : 'secondary';
    points.push({
      id: normalize(country),
      lat: coords.lat,
      lng: coords.lng,
      country,
      count,
      tone,
    });
  }

  return [{ ...COSTA_RICA_NODE, count: crEntry?.count ?? 0 }, ...points];
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

type CollaborationMapPreviewProps = {
  title?: string;
  subtitle?: string;
  scopeLabel?: string;
  points?: CollaborationPoint[];
};

const DEFAULT_POINTS: CollaborationPoint[] = [
  {
    id: 'cr',
    lat: 9.7489,
    lng: -83.7534,
    country: 'Costa Rica',
    count: 0,
    tone: 'accent',
    isMain: true,
  },
  {
    id: 'us',
    lat: 37.0902,
    lng: -95.7129,
    country: 'Estados Unidos',
    count: 12,
    tone: 'primary',
    institutions: [
      { name: 'University of Florida', researchCount: 5, projectCount: 2 },
      { name: 'MIT', researchCount: 4, projectCount: 1 },
      { name: 'Stanford University', researchCount: 3, projectCount: 1 },
    ],
  },
  {
    id: 'es',
    lat: 40.4637,
    lng: -3.7492,
    country: 'España',
    count: 8,
    tone: 'primary',
    institutions: [
      { name: 'Universidad Complutense de Madrid', researchCount: 5, projectCount: 2 },
      { name: 'Universidad de Barcelona', researchCount: 3, projectCount: 1 },
    ],
  },
  {
    id: 'mx',
    lat: 23.6345,
    lng: -102.5528,
    country: 'México',
    count: 6,
    tone: 'primary',
    institutions: [
      { name: 'UNAM', researchCount: 4, projectCount: 2 },
      { name: 'IPN', researchCount: 2, projectCount: 1 },
    ],
  },
  {
    id: 'de',
    lat: 51.1657,
    lng: 10.4515,
    country: 'Alemania',
    count: 4,
    tone: 'secondary',
    institutions: [
      { name: 'Technische Universität München', researchCount: 3, projectCount: 1 },
      { name: 'Heidelberg University', researchCount: 1, projectCount: 0 },
    ],
  },
  {
    id: 'br',
    lat: -14.235,
    lng: -51.9253,
    country: 'Brasil',
    count: 3,
    tone: 'secondary',
    institutions: [
      { name: 'Universidade de São Paulo', researchCount: 3, projectCount: 1 },
    ],
  },
  {
    id: 'co',
    lat: 4.5709,
    lng: -74.2973,
    country: 'Colombia',
    count: 2,
    tone: 'secondary',
    institutions: [
      { name: 'Universidad de los Andes', researchCount: 2, projectCount: 0 },
    ],
  },
  {
    id: 'fr',
    lat: 46.2276,
    lng: 2.2137,
    country: 'Francia',
    count: 2,
    tone: 'secondary',
    institutions: [
      { name: 'Université Paris-Saclay', researchCount: 2, projectCount: 1 },
    ],
  },
];

const WORLD_GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const PIN_PATH =
  'M 0,-12 C -6,-12 -10,-7 -10,-2 C -10,6 0,14 0,14 C 0,14 10,6 10,-2 C 10,-7 6,-12 0,-12 Z';

function pinFill(tone: CollaborationPoint['tone']): string {
  if (tone === 'accent') return '#F97316';
  if (tone === 'secondary') return '#60A5FA';
  return '#0B66B2';
}

export default function CollaborationMapPreview({
  title = 'Redes de colaboracion',
  subtitle = 'Haga clic en los puntos para mostrar los detalles.',
  scopeLabel = 'Mapa general',
  points = DEFAULT_POINTS,
}: CollaborationMapPreviewProps) {
  const [selected, setSelected] = useState<CollaborationPoint | null>(null);

  function handleMarkerClick(point: CollaborationPoint) {
    setSelected((prev) => (prev?.id === point.id ? null : point));
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h4 font-semibold text-[var(--color-text-neutral-primary)]">
          {title}
        </h2>
        <span className="rounded-full border border-[var(--color-gray-300)] bg-white px-3 py-1 text-body-sm text-[var(--color-text-neutral-secondary)]">
          {scopeLabel}
        </span>
      </div>

      <p className="mt-2 max-w-4xl text-body-md text-[var(--color-text-neutral-secondary)]">
        {subtitle}
      </p>

      {/* Map container — relative so the panel can be absolute inside */}
      <div className="relative mt-6 h-[520px] overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 124, center: [0, 40] }}
          width={1200}
          height={520}
          className="h-full w-full select-none"
        >
          <Geographies geography={WORLD_GEO_URL}>
            {({ geographies }: { geographies: Record<string, unknown>[] }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey as string}
                  geography={geo}
                  fill="#B8BDC3"
                  stroke="#9EA5AD"
                  strokeWidth={0.6}
                  tabIndex={-1}
                  onFocus={(event: React.FocusEvent<SVGPathElement>) =>
                    event.currentTarget.blur()
                  }
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#B8BDC3' },
                    pressed: { outline: 'none', fill: '#B8BDC3' },
                  }}
                />
              ))
            }
          </Geographies>

          {points.map((point) => {
            const fill = pinFill(point.tone);
            const isSelected = selected?.id === point.id;

            return (
              <Marker
                key={point.id}
                coordinates={[point.lng, point.lat]}
                tabIndex={-1}
                onClick={() => handleMarkerClick(point)}
                style={{ cursor: 'pointer' }}
              >
                <title>
                  {point.isMain
                    ? 'Nodo principal: UCR, Costa Rica'
                    : `${point.country} — ${point.count} colaborador${point.count !== 1 ? 'es' : ''}`}
                </title>
                {isSelected && (
                  <circle
                    r={14}
                    cy={-2}
                    fill="none"
                    stroke={fill}
                    strokeWidth={2}
                    opacity={0.5}
                  />
                )}
                <path d={PIN_PATH} fill={fill} stroke="#ffffff" strokeWidth={1.2} />
                <circle r={3.5} cy={-2} fill="#ffffff" />
              </Marker>
            );
          })}
        </ComposableMap>

        {/* Floating detail panel — appears on marker click */}
        {selected && (
          <div className="absolute bottom-4 left-4 z-10 flex w-64 max-h-72 flex-col overflow-hidden rounded-xl border border-[var(--color-gray-300)] bg-white shadow-lg">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-bold text-gray-900">{selected.country}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar panel"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-gray-100">
              {selected.isMain ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {selected.count > 0
                    ? `${selected.count} autor${selected.count !== 1 ? 'es' : ''} UCR`
                    : 'Nodo principal UCR'}
                </div>
              ) : selected.institutions && selected.institutions.length > 0 ? (
                selected.institutions.map((inst, i) => (
                  <div key={i} className="px-4 py-3">
                    <p className="mb-1.5 text-xs font-medium text-gray-800">
                      {inst.name}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-[#0B66B2]">
                      <BookOpen size={11} />
                      {inst.researchCount} resultado{inst.researchCount !== 1 ? 's' : ''}{' '}
                      de investigación compartida
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#0B66B2]">
                      <FolderOpen size={11} />
                      {inst.projectCount} proyecto{inst.projectCount !== 1 ? 's' : ''}{' '}
                      compartido{inst.projectCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-gray-500">
                  {selected.count} colaborador{selected.count !== 1 ? 'es' : ''}{' '}
                  registrado{selected.count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
