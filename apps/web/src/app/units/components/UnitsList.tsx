import { useRouter } from 'next/navigation';
import UnitCard from './unitCard';
import type { Unit } from '@/services/units';

interface UnitsListProps {
  units: Unit[];
}

export default function UnitsList({ units }: UnitsListProps) {
  const router = useRouter();

  if (units.length === 0) {
    return (
      <div
        className="col-span-full flex flex-col items-center justify-center py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium text-[var(--color-text-neutral-secondary)]">
          No se encontraron resultados.
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-neutral-tertiary)]">
          Intenta ajustar los filtros o el término de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12">
      {units.map((unit) => (
        <UnitCard
          key={unit.id}
          name={unit.name}
          url={`/units/mock-images/logos/${unit.id}.png`}
          onClick={() => router.push(`/units/${unit.id}`)}
        />
      ))}
    </div>
  );
}
