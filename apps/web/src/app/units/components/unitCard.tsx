/**
 * Props for the UnitCard component.
 */
type UnitCardProps = {
  name: string;
  onClick?: () => void;
  logoSvgContent?: string | null;
  logoUnitAcronym?: string | null;
};

/**
 * UnitCard component.
 *
 * Displays an academic unit as a card with a logo placeholder and its name.
 *
 * @example
 * <UnitCard name="Escuela de Estadística" />
 */
export default function UnitCard({
  name,
  onClick,
  logoSvgContent,
  logoUnitAcronym,
}: UnitCardProps) {
  return (
    <div
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="flex flex-col items-center gap-4 cursor-pointer group w-full max-w-sm mx-auto bg-white border border-neutral-200/60 rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] hover:border-blue-300 hover:bg-neutral-50/30 hover:shadow-md focus-visible:outline-2"
    >
      <div className="w-full h-24 flex items-center justify-center bg-transparent overflow-hidden">
        {logoSvgContent ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:!w-full [&>svg]:!h-full [&>svg]:object-fill"
            dangerouslySetInnerHTML={{ __html: logoSvgContent }}
          />
        ) : (
          <div className="text-center">
            <span className="text-h4 font-bold tracking-wider text-[var(--color-text-brand-primary)]">
              {logoUnitAcronym ?? name.substring(0, 3).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="w-16 h-[2px] bg-neutral-200 group-hover:bg-blue-400 transition-colors" />

      <p className="text-center text-[var(--color-text-neutral-title)] text-body-sm-md font-bold leading-relaxed line-clamp-2 px-2 min-h-[44px] flex items-center justify-center group-hover:text-blue-900">
        {name}
      </p>
    </div>
  );
}
