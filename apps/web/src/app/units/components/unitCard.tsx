import { useState } from 'react';

/**
 * Props for the UnitCard component.
 */
type UnitCardProps = {
  name: string;
  onClick?: () => void;
  url?: string;
};

function getInitials(name: string): string {
  return name
    .replace(/\(.*?\)/g, '')
    .split(' ')
    .filter(
      (word) =>
        word.length > 0 && word[0] === word[0].toUpperCase() && isNaN(Number(word[0])),
    )
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * UnitCard component.
 *
 * Displays an academic unit as a card with a logo placeholder and its name.
 *
 * @example
 * <UnitCard name="Escuela de Estadística" />
 */
export default function UnitCard({ name, onClick, url }: UnitCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPlaceholder = !url || imgFailed;

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-3 cursor-pointer group"
    >
      <div className="w-32 h-32 rounded-md flex items-center justify-center bg-[var(--color-bg-brand-secondary)]">
        {showPlaceholder ? (
          <span className="text-5xl font-bold text-[var(--color-text-brand-primary)]">
            {getInitials(name)}
          </span>
        ) : (
          <img src={url} alt={name} onError={() => setImgFailed(true)} />
        )}
      </div>
      <p className="text-center text-[var(--color-text-brand-primary)] font-medium leading-snug group-hover:underline">
        {name}
      </p>
    </div>
  );
}
