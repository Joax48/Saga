import type { ProfileType } from '@/types/researcher-data';

interface ProfileTypeBadgeProps {
  type: ProfileType;
  className?: string;
}

const LABELS: Record<ProfileType, string> = {
  UCR: 'UCR',
  EXTERNAL: 'Externo',
};

/**
 * Small pill that flags whether a profile belongs to a UCR member or an
 * external co-author. UCR uses the branded blue; external uses a neutral grey.
 */
export default function ProfileTypeBadge({
  type,
  className = '',
}: ProfileTypeBadgeProps) {
  const isUcr = type === 'UCR';

  const style = isUcr
    ? { backgroundColor: 'var(--color-bg-info-subtle)', color: '#fff' }
    : {
        backgroundColor: 'var(--color-bg-neutral-tertiary)',
        color: 'var(--color-text-neutral-secondary)',
      };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${className}`}
      style={style}
    >
      {LABELS[type]}
    </span>
  );
}
