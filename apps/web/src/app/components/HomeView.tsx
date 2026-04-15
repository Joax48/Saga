'use client';
import TopNavigation from './TopNavigation';
import PageHeroSearch from '@/components/PageHeroSearch';
import CollaborationMapPreview from '@/components/CollaborationMapPreview';

interface Props {}

export function HomeView() {
  return (
    <div>
      <PageHeroSearch
        items={[{ label: '' }]}
        title="Inicio"
        searchPlaceholder="Buscar..."
        onSearch={() => {}}
      />
      <section className="px-6 lg:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <TopNavigation />

          <hr className="border-t border-gray-300 mt-2" />

          <div className="py-8">
            <h1 className="text-2xl font-bold mb-4">
              Sistema de Gestión de Investigación y Producción Académica de la UCR
            </h1>

            <p className="text-gray-600 leading-relaxed">
              El Sistema de Información de Investigación de la Universidad de Costa Rica
              (UCR) es un CRIS que integra perfiles de investigadores, unidades
              académicas, producción científica y proyectos, así como producciones no
              científicas. Además, Además, ofrece un espacio interactivo de visualización
              estadística mediante dashboards, permitiendo monitorear tendencias, analizar
              datos institucionales y facilitar la toma de decisiones estratégicas. La
              plataforma busca mejorar la visibilidad de la actividad académica, promover
              la colaboración y apoyar la excelencia científica y académica de la
              Universidad.
            </p>

            <CollaborationMapPreview />
          </div>

          <hr className="border-t border-gray-300 mt-2 py-5" />

          <h1 className="text-3xl font-bold mb-6"> Producción científica destacada </h1>
          <div className="flex-1 min-w-0">
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
          </div>
        </div>
      </section>
    </div>
  );
}
