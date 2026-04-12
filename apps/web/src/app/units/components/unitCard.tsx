/**
 * Props for the UnitCard component.
 */
type UnitCardProps = {
  name: string;
  onClick?: () => void;
  url: string;
};

/**
 * UnitCard component.
 *
 * Displays an academic unit as a card with a logo placeholder and its name.
 *
 * @example
 * <UnitCard name="Escuela de Estadística" />
 */
export default function UnitCard({ name, onClick, url }: UnitCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-3 cursor-pointer group"
    >
      {/* Logo placeholder */}
      <div className="w-32 h-32 rounded-md flex items-center justify-center">
        <img src={url} alt="Logo" />
      </div>

      {/* Unit name */}
      <p className="text-center text-[var(--color-text-brand-primary)] font-medium leading-snug group-hover:underline">
        {name}
      </p>
    </div>
  );
}
