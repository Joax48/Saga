'use client';

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

type CollaborationPoint = {
  id: string;
  lat: number;
  lng: number;
  tone?: 'primary' | 'secondary' | 'accent';
  tooltip: string;
};

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
    tone: 'accent',
    tooltip: 'Nodo principal: Costa Rica',
  },
  {
    id: 'mx',
    lat: 23.6345,
    lng: -102.5528,
    tone: 'primary',
    tooltip: 'Colaboracion con Mexico',
  },
  {
    id: 'us',
    lat: 39.8283,
    lng: -98.5795,
    tone: 'primary',
    tooltip: 'Colaboracion con Estados Unidos',
  },
  {
    id: 'ca',
    lat: 56.1304,
    lng: -106.3468,
    tone: 'secondary',
    tooltip: 'Colaboracion con Canada',
  },
  {
    id: 'co',
    lat: 4.5709,
    lng: -74.2973,
    tone: 'secondary',
    tooltip: 'Colaboracion con Colombia',
  },
  {
    id: 'br',
    lat: -14.235,
    lng: -51.9253,
    tone: 'primary',
    tooltip: 'Colaboracion con Brasil',
  },
  {
    id: 'ar',
    lat: -38.4161,
    lng: -63.6167,
    tone: 'secondary',
    tooltip: 'Colaboracion con Argentina',
  },
  {
    id: 'es',
    lat: 40.4637,
    lng: -3.7492,
    tone: 'primary',
    tooltip: 'Colaboracion con Espana',
  },
  {
    id: 'fr',
    lat: 46.2276,
    lng: 2.2137,
    tone: 'primary',
    tooltip: 'Colaboracion con Francia',
  },
  {
    id: 'uk',
    lat: 55.3781,
    lng: -3.436,
    tone: 'secondary',
    tooltip: 'Colaboracion con Reino Unido',
  },
  {
    id: 'jp',
    lat: 36.2048,
    lng: 138.2529,
    tone: 'secondary',
    tooltip: 'Colaboracion con Japon',
  },
  {
    id: 'au',
    lat: -25.2744,
    lng: 133.7751,
    tone: 'secondary',
    tooltip: 'Colaboracion con Australia',
  },
];

const WORLD_GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function pointToneColors(tone: CollaborationPoint['tone']): {
  fill: string;
  halo: string;
} {
  if (tone === 'accent') return { fill: '#F97316', halo: '#FDBA74' };
  if (tone === 'secondary') return { fill: '#60A5FA', halo: '#BFDBFE' };
  return { fill: '#0B66B2', halo: '#93C5FD' };
}

export default function CollaborationMapPreview({
  title = 'Redes de colaboracion',
  subtitle = 'Vista de ejemplo para la capa visual. Luego se conectara con datos reales desde backend por perfil, unidad y produccion cientifica.',
  scopeLabel = 'Mapa general',
  points = DEFAULT_POINTS,
}: CollaborationMapPreviewProps) {
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

      <div className="relative mt-6 h-[520px] overflow-hidden border border-[var(--color-gray-300)] bg-[#EEF1F4]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 124, center: [0, 40] }}
          width={1200}
          height={520}
          className="h-full w-full select-none"
        >
          <Geographies geography={WORLD_GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
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
            const tone = pointToneColors(point.tone);

            return (
              <Marker key={point.id} coordinates={[point.lng, point.lat]} tabIndex={-1}>
                <title>{point.tooltip}</title>
                <circle r={7} fill={tone.halo} opacity={0.95} />
                <circle r={5.4} fill={tone.fill} stroke="#ffffff" strokeWidth={1.2} />
              </Marker>
            );
          })}
        </ComposableMap>

        <div className="absolute bottom-4 left-4 rounded-xl border border-[var(--color-gray-300)] bg-white/95 px-3 py-2 text-body-sm text-[var(--color-text-neutral-secondary)]">
          <p>
            <span className="font-medium text-[var(--color-text-neutral-primary)]">
              Simulacion visual
            </span>{' '}
            de nodos de colaboracion.
          </p>
        </div>
      </div>
    </section>
  );
}
