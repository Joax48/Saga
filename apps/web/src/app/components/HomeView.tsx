'use client';

import { ProductionCard } from '../scientific-productions/components/ProductionCard';
import type { ScientificProduction } from '@/types';
import TopNavigation from './TopNavigation';
import PageHeroSearch from '@/components/PageHeroSearch';

interface Props {
  productions: ScientificProduction[];
}

export function HomeView({ productions }: Props) {
  const firstFour = productions.slice(0, 4);

  return (
    <div>
      <PageHeroSearch
        items={[{ label: '' }]}
        title="Inicio"
        searchPlaceholder="Buscar..."
        onSearch={() => {}}
      />
      <div className="max-w-6xl mx-auto sm:px-31 py-10">
        <hr className="border-t border-gray-300 mt-2" />

        <div className="">
          <TopNavigation />
        </div>

        <hr className="border-t border-gray-300 mt-2" />

        <div className="max-w-6xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">
            Sistema de Gestión de Investigación y Producción Académica de la UCR
          </h1>

          <p className="text-gray-600 leading-relaxed">
            El Sistema de Información de Investigación de la Universidad de Costa Rica (UCR)
            es un CRIS que integra perfiles de investigadores, unidades académicas,
            producción científica y proyectos, así como producciones no científicas. Además,
            Además, ofrece un espacio interactivo de visualización estadística mediante
            dashboards, permitiendo monitorear tendencias, analizar datos institucionales
            y facilitar la toma de decisiones estratégicas. La plataforma busca mejorar la
            visibilidad de la actividad académica, promover la colaboración y apoyar la
            excelencia científica y académica de la Universidad.
          </p>
        </div>

        <hr className="border-t border-gray-300 mt-2 py-5" />

        <h1 className="text-3xl font-bold mb-6"> Producción científica destacada </h1>
        <div className="flex-1 min-w-0">
          {firstFour.length > 0 ? (
            <div className="space-y-6">
              {firstFour.map((production) => (
                <ProductionCard key={production.id} production={production} />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-base font-medium text-gray-500">
                No se encontraron resultados.
              </p>
              <p className="mt-1 text-sm text-gray-400">Intenta nuevamente más tarde.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
